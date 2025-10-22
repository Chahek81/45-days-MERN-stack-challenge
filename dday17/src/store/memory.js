const { v4: uuidv4 } = require('uuid');

const users = new Map();
const posts = new Map();

module.exports = {
  reset() {
    users.clear();
    posts.clear();
  },

  createUser(data) {
    const id = uuidv4();
    const user = { id, ...data };
    users.set(id, user);
    return user;
  },

  getUser(id) { return users.get(id); },
  listUsers() { return Array.from(users.values()); },
  updateUser(id, data) {
    if (!users.has(id)) return null;
    const u = Object.assign({}, users.get(id), data);
    users.set(id, u);
    return u;
  },
  deleteUser(id) { return users.delete(id); },

  createPost(data) {
    const id = uuidv4();
    const post = { id, ...data };
    posts.set(id, post);
    return post;
  },
  getPost(id) { return posts.get(id); },
  listPosts() { return Array.from(posts.values()); },
  updatePost(id, data) {
    if (!posts.has(id)) return null;
    const p = Object.assign({}, posts.get(id), data);
    posts.set(id, p);
    return p;
  },
  deletePost(id) { return posts.delete(id); },

  search(query) {
    const q = (query || '').toLowerCase();
    const userResults = Array.from(users.values()).filter(u =>
      u.name.toLowerCase().includes(q) || (u.email && u.email.toLowerCase().includes(q))
    );
    const postResults = Array.from(posts.values()).filter(p =>
      p.title.toLowerCase().includes(q) || (p.body && p.body.toLowerCase().includes(q))
    );
    return { users: userResults, posts: postResults };
  }
};
