// ProjectCard.jsx
import React from 'react'
import PropTypes from 'prop-types'
import './ProjectCard.css'

const ProjectCard = ({ title, description }) => {
  return (
    <div className="project-card">
      <h2 className="project-title">{title}</h2>
      <p className="project-description">{description}</p>
    </div>
  )
}

ProjectCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
}

export default ProjectCard