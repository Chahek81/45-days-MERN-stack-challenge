import React from 'react'
import ProjectCard from './components/ProjectCard'
import './App.css'

function App() {
  const projects = [
    {
      title: "🛍️ E-commerce Platform",
      description: "Experience seamless shopping with our modern e-commerce platform. Features include real-time inventory, secure payments, and personalized recommendations."
    },
    {
      title: "🌤️ Weather Dashboard",
      description: "Stay ahead of the weather with our beautiful weather tracking app. Get hourly forecasts, severe weather alerts, and interactive radar maps."
    },
    {
      title: "✅ Task Manager Pro",
      description: "Boost your productivity with our intuitive task manager. Features include drag-and-drop organization, priority levels, and deadline reminders."
    },
    {
      title: "🎮 Gaming Hub",
      description: "Connect with fellow gamers in our social gaming platform. Share achievements, join tournaments, and discover new gaming communities."
    },
    {
      title: "📚 Learning Portal",
      description: "Transform your learning journey with our interactive education platform. Access courses, track progress, and earn certificates."
    },
    {
      title: "🎵 Music Studio",
      description: "Create and share music with our cloud-based studio. Features include multi-track recording, virtual instruments, and collaboration tools."
    }
  ]

  return (
    <div className="app">
      <h1>My Projects</h1>
      <div className="projects-container">
        {projects.map((project, index) => (
          <ProjectCard
            key={index}
            title={project.title}
            description={project.description}
          />
        ))}
      </div>
    </div>
  )
}

export default App