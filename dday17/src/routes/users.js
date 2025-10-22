const express = require('express');
const store = require('../store/memory');
const router = express.Router();

router.post('/', (req, res) => {
  const { name, email } = req.body;
  if (!name || typeof name !== 'string') return res.status(400).json({error: 'invalid_name'});
  if (!email || !/^[^@]+@[^@]+$/.test(email)) return res.status(400).json({error: 'invalid_email'});
  const user = store.createUser({ name, email });
  res.status(201).json(user);
});

router.get('/', (req, res) => res.json(store.listUsers()));
router.get('/:id', (req, res) => {
  const u = store.getUser(req.params.id);
  if (!u) return res.status(404).json({error: 'not_found'});
  res.json(u);
});

router.put('/:id', (req, res) => {
  const { name, email } = req.body;
  const updated = store.updateUser(req.params.id, { name, email });
  if (!updated) return res.status(404).json({error: 'not_found'});
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const ok = store.deleteUser(req.params.id);
  if (!ok) return res.status(404).json({error: 'not_found'});
  res.status(204).send();
});

module.exports = router;
