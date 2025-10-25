import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div className="App">
      <header className="App-header">
        <h1>Project Management Dashboard</h1>
        <button onClick={fetchProjects} className="refresh-button">
          Refresh Projects
        </button>
      </header>

      <main className="content">
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="projects-list">
            {projects.map((project) => (
              <div key={project.id} className="project-item">
                <div className="project-title">{project.title}</div>
                <div className="project-status">{project.status}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
