const express = require('express');
const router = express.Router();

const Technology = require('../models/Technology');
const Project = require('../models/Project');
const Experience = require('../models/Experience');

// GET /api/search?q=term&resource=projects|technologies|experiences&limit=10&offset=0
router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  const resource = (req.query.resource || 'all').toLowerCase();
  const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);
  const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);

  if (!q) return res.status(400).json({ message: 'query `q` is required' });

  try {
    const isDb = !!(require('mongoose').connection.readyState);
    if (!isDb) {
      // simple mock search across resource types
      const term = q.toLowerCase();
      const results = {
        technologies: ['React','Node'].filter(t => t.toLowerCase().includes(term)).slice(offset, offset + limit),
        projects: ['Portfolio site'].filter(p => p.toLowerCase().includes(term)).slice(offset, offset + limit),
        experiences: ['Acme'].filter(e => e.toLowerCase().includes(term)).slice(offset, offset + limit)
      };
      return res.json({ q, resource, results });
    }

    const regex = new RegExp(q.split(/\s+/).map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');

    const queries = [];
    if (resource === 'all' || resource === 'technologies') {
      queries.push(Technology.find({ name: regex }).limit(limit).skip(offset).lean());
    } else {
      queries.push(Promise.resolve([]));
    }

    if (resource === 'all' || resource === 'projects') {
      queries.push(Project.find({ $or: [ { title: regex }, { description: regex } ] }).limit(limit).skip(offset).populate('technologies').lean());
    } else {
      queries.push(Promise.resolve([]));
    }

    if (resource === 'all' || resource === 'experiences') {
      queries.push(Experience.find({ $or: [ { company: regex }, { role: regex } ] }).limit(limit).skip(offset).populate('technologies').lean());
    } else {
      queries.push(Promise.resolve([]));
    }

    const [techs, projects, exps] = await Promise.all(queries);

    // scoring heuristics: exact match > startsWith > contains; weight fields
    function scoreTechnology(t) {
      const name = (t.name || '').toLowerCase();
      const ql = q.toLowerCase();
      if (name === ql) return 100;
      if (name.startsWith(ql)) return 70;
      if (name.includes(ql)) return 40;
      return 10;
    }

    function scoreProject(p) {
      const title = (p.title || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const ql = q.toLowerCase();
      let s = 0;
      if (title === ql) s += 80;
      if (title.startsWith(ql)) s += 50;
      if (title.includes(ql)) s += 30;
      if (desc.includes(ql)) s += 20;
      return s || 5;
    }

    function scoreExperience(e) {
      const company = (e.company || '').toLowerCase();
      const role = (e.role || '').toLowerCase();
      const ql = q.toLowerCase();
      let s = 0;
      if (company === ql) s += 60;
      if (company.includes(ql)) s += 30;
      if (role.includes(ql)) s += 20;
      return s || 5;
    }

    const ranked = {
      technologies: (techs || []).map(t => ({ type: 'technology', score: scoreTechnology(t), ...t })).sort((a,b) => b.score - a.score),
      projects: (projects || []).map(p => ({ type: 'project', score: scoreProject(p), ...p })).sort((a,b) => b.score - a.score),
      experiences: (exps || []).map(e => ({ type: 'experience', score: scoreExperience(e), ...e })).sort((a,b) => b.score - a.score)
    };

    // combined across types, with type weight (technology higher)
    const combined = [].concat(
      ranked.technologies.map(r => ({ weight: 3, ...r })),
      ranked.projects.map(r => ({ weight: 2, ...r })),
      ranked.experiences.map(r => ({ weight: 1, ...r }))
    ).map(r => ({ ...r, finalScore: r.score * r.weight })).sort((a,b) => b.finalScore - a.finalScore);

    res.json({ q, resource, results: { ranked, combined } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
