const express = require('express');
const router = express.Router();

const Technology = require('../models/Technology');
const Project = require('../models/Project');
const Experience = require('../models/Experience');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 * 5 }); // 5 minutes

// GET /api/analytics/skills
// returns skills counts (from Profile.skills and technology usage)
router.get('/skills', async (req, res) => {
  try {
    const cached = cache.get('analytics:skills');
    if (cached) return res.json({ skills: cached, cached: true });
    const isDb = !!(require('mongoose').connection.readyState);
    if (!isDb) {
      const mock = [ { skill: 'JavaScript', count: 12 }, { skill: 'React', count: 9 } ];
      cache.set('analytics:skills', mock);
      return res.json({ skills: mock });
    }

    // aggregate technology usage across projects and experiences
    const projectTechs = await Project.aggregate([
      { $unwind: '$technologies' },
      { $group: { _id: '$technologies', count: { $sum: 1 } } },
      { $lookup: { from: 'technologies', localField: '_id', foreignField: '_id', as: 'tech' } },
      { $unwind: '$tech' },
      { $project: { _id: 0, technology: '$tech.name', count: 1 } },
      { $sort: { count: -1 } }
    ]);

    cache.set('analytics:skills', projectTechs);
    res.json({ skills: projectTechs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/career
// returns simple career progression metrics
router.get('/career', async (req, res) => {
  try {
    const cached = cache.get('analytics:career');
    if (cached) return res.json({ timeline: cached, cached: true });
    const isDb = !!(require('mongoose').connection.readyState);
    if (!isDb) return res.json({ timeline: [ { year: 2020, role: 'Junior' }, { year: 2022, role: 'Senior' } ] });

    const timeline = await Experience.aggregate([
      { $project: { company: 1, role: 1, start: '$startYear', end: '$endYear' } },
      { $sort: { start: 1 } }
    ]);

    cache.set('analytics:career', timeline);
    res.json({ timeline });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/technology
// technology popularity trends
router.get('/technology', async (req, res) => {
  try {
    const cached = cache.get('analytics:technology');
    if (cached) return res.json({ trends: cached, cached: true });
    const isDb = !!(require('mongoose').connection.readyState);
    if (!isDb) return res.json({ trends: [ { technology: 'React', score: 95 } ] });

    const trends = await Technology.find().sort({ popularity: -1 }).limit(20).lean();
    cache.set('analytics:technology', trends);
    res.json({ trends });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
