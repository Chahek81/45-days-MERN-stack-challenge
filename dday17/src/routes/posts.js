const express = require('express');
const store = require('../store/memory');
const router = express.Router();

router.post('/', (req, res) => {
  const { title, body, authorId } = req.body;
  if (!title || typeof title !== 'string') return res.status(400).json({error: 'invalid_title'});
  if (!authorId || !store.getUser(authorId)) return res.status(400).json({error: 'invalid_author'});
  const post = store.createPost({ title, body: body || '', authorId });
  res.status(201).json(post);
});

router.get('/', (req, res) => res.json(store.listPosts()));
router.get('/:id', (req, res) => {
  const p = store.getPost(req.params.id);
  if (!p) return res.status(404).json({error: 'not_found'});
  res.json(p);
});

router.put('/:id', (req, res) => {
  const { title, body } = req.body;
  const updated = store.updatePost(req.params.id, { title, body });
  if (!updated) return res.status(404).json({error: 'not_found'});
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const ok = store.deletePost(req.params.id);
  if (!ok) return res.status(404).json({error: 'not_found'});
  res.status(204).send();
});

module.exports = router;
