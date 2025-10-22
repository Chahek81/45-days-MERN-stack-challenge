const express = require('express');
const bodyParser = require('body-parser');
const users = require('./routes/users');
const posts = require('./routes/posts');
const search = require('./routes/search');

const app = express();
app.use(bodyParser.json());

app.use('/health', (req, res) => res.json({status: 'ok'}));
app.use('/users', users);
app.use('/posts', posts);
app.use('/search', search);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({error: 'internal_error', message: err.message});
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server listening on ${port}`));
}

module.exports = app;
