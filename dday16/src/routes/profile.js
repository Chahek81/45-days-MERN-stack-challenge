const express = require('express');
const router = express.Router();

const Profile = require('../models/Profile');
const Project = require('../models/Project');
const Experience = require('../models/Experience');

// GET /api/profile/dashboard
router.get('/dashboard', async (req, res) => {
  // If connected to DB return aggregated profile, otherwise return mock
  try {
    const isDb = !!(require('mongoose').connection.readyState);
    if (!isDb) {
      return res.json({
        name: 'Jane Developer',
        headline: 'Full-stack engineer',
        skills: ['JavaScript','Node.js','React'],
        recentProjects: [
          { title: 'Portfolio site', year: 2024, technologies: ['React','Node'] }
        ],
        experiences: [ { company: 'Acme', role: 'Engineer', startYear: 2021 } ]
      });
    }

    // Real DB: populate profile with projects and experiences
    const profile = await Profile.findOne().populate({
      path: 'projects',
      populate: { path: 'technologies' }
    }).populate({
      path: 'experiences',
      populate: { path: 'technologies' }
    }).lean();

    if (!profile) return res.status(404).json({ message: 'No profile found' });

    // derive some quick stats
    const techSet = new Set();
    (profile.projects || []).forEach(p => (p.technologies || []).forEach(t => techSet.add(t.name)));
    (profile.experiences || []).forEach(e => (e.technologies || []).forEach(t => techSet.add(t.name)));

    res.json({
      name: profile.name,
      headline: profile.headline,
      skills: profile.skills,
      recentProjects: profile.projects,
      experiences: profile.experiences,
      technologyFootprint: Array.from(techSet)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/profile/portfolio
router.get('/portfolio', async (req, res) => {
  try {
    const isDb = !!(require('mongoose').connection.readyState);
    if (!isDb) {
      return res.json({ projects: [ { title: 'Demo', description: 'Mock project', technologies: ['JS','Express'] } ] });
    }

    const projects = await Project.find().populate('technologies').lean();
    res.json({ projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
