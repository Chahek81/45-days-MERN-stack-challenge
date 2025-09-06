// server.js
const express = require("express");
const app = express();
const PORT = 3000;

// Hard-coded data
const projects = [
  { id: 1, title: "Portfolio Website", description: "Personal portfolio built with React and TailwindCSS." },
  { id: 2, title: "Task Manager API", description: "REST API for managing tasks using Node.js and Express." },
  { id: 3, title: "E-commerce Store", description: "Full-stack e-commerce app with payment integration." }
];

const experience = [
  { id: 1, company: "TechCorp", role: "Software Engineer", years: "2022 - Present" },
  { id: 2, company: "Webify", role: "Frontend Developer", years: "2020 - 2022" }
];

// Routes

// GET all projects
app.get("/api/projects", (req, res) => {
  res.json(projects);
});

// GET single project by ID
app.get("/api/projects/:id", (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = projects.find(p => p.id === projectId);

  if (project) {
    res.json(project);
  } else {
    res.status(404).json({ message: "Project not found" });
  }
});

// GET work experience
app.get("/api/experience", (req, res) => {
  res.json(experience);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
