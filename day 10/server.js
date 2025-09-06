// Import the express library
const express = require('express');

// Initialize the express application
const app = express();
const PORT = 3000;

// An in-memory array to act as our "database"
let projects = [];
let nextProjectId = 1;

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// -------------------- CREATE (POST) Operation --------------------
// Handles POST requests to the /api/projects endpoint
app.post('/api/projects', (req, res) => {
    // Get the new project data from the request body
    const newProject = req.body;

    // A simple check to ensure the project has a name
    if (!newProject || !newProject.name) {
        return res.status(400).json({ error: 'Project name is required' });
    }

    // Assign a unique ID to the new project
    const projectWithId = {
        id: nextProjectId++,
        ...newProject
    };

    // Add the new project to our in-memory "database"
    projects.push(projectWithId);

    // Send a response back with the created project
    res.status(201).json(projectWithId);
    console.log(`Project created: ${JSON.stringify(projectWithId)}`);
});

// -------------------- READ (GET) Operation --------------------
// Handles GET requests to the /api/projects endpoint
app.post('/api/projects', (req, res) => {
    // Return all projects from our "database" as a JSON array
    res.json(projects);
    console.log('All projects requested and sent.');
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:3000/api/projects`);
    console.log('Use an API client like Postman to test the endpoints.');
});