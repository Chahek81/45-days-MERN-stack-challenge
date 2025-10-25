import React from 'react';
import './ProjectCard.css';

function ProjectCard({ title, description, technology }) {
  return (
    <div className="project-card">
      <h2>{title}</h2>
      <p className="description">{description}</p>
      <div className="technology">{technology}</div>
    </div>
  );
}

export default ProjectCard;