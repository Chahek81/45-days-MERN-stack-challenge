import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample projects data
const projects = [
  { id: 1, title: 'E-commerce Platform', status: 'In Progress' },
  { id: 2, title: 'Social Media App', status: 'Completed' },
  { id: 3, title: 'Task Management Tool', status: 'Planning' }
];

// GET /api/projects endpoint
app.get('/api/projects', (req, res) => {
  // Simulate network delay
  setTimeout(() => {
    res.json(projects);
  }, 1000);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});