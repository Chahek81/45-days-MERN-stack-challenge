const express = require('express');
const path = require('path');

const app = express();

const PORT = 3000;

app.get('/api', (req, res) => {
  res.json({ message: "API is running!" });
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:3000/api
`);
});

