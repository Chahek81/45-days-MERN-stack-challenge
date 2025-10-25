import React, { useState } from 'react';
import ProjectCard from './components/ProjectCard';
import './App.css';

function App() {
  const [projects] = useState([
    {
      id: 1,
      title: "E-commerce Platform",
      description: "A full-stack e-commerce solution with React and Node.js",
      technology: "MERN Stack"
    },
    {
      id: 2,
      title: "Task Management App",
      description: "A collaborative task tracking application",
      technology: "React & Firebase"
    },
    {
      id: 3,
      title: "Weather Dashboard",
      description: "Real-time weather monitoring dashboard",
      technology: "React & Weather API"
    },
    {
      id: 4,
      title: "Social Media Clone",
      description: "A social networking platform with real-time features",
      technology: "MERN Stack & Socket.io"
    }
  ]);

  return (
    <div className="app">
      <h1>My Projects Portfolio</h1>
      <div className="projects-grid">
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            title={project.title}
            description={project.description}
            technology={project.technology}
          />
        ))}
      </div>
    </div>
  );
}

export default App;