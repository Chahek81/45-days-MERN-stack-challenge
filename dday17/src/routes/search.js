const express = require('express');
const store = require('../store/memory');
const router = express.Router();

router.get('/', (req, res) => {
  const q = req.query.q || '';
  res.json(store.search(q));
});

module.exports = router;
