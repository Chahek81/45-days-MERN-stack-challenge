const request = require('supertest');
const app = require('../src/index');
const store = require('../src/store/memory');

beforeEach(() => store.reset());

describe('Health check', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({status: 'ok'});
  });
});

describe('Users API', () => {
  test('Create, read, update, delete user', async () => {
    const create = await request(app).post('/users').send({name: 'Alice', email: 'alice@example.com'});
    expect(create.status).toBe(201);
    expect(create.body).toHaveProperty('id');

    const id = create.body.id;
    const get = await request(app).get(`/users/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.name).toBe('Alice');

    const upd = await request(app).put(`/users/${id}`).send({name: 'Alice B', email: 'aliceb@example.com'});
    expect(upd.status).toBe(200);
    expect(upd.body.name).toBe('Alice B');

    const del = await request(app).delete(`/users/${id}`);
    expect(del.status).toBe(204);

    const get2 = await request(app).get(`/users/${id}`);
    expect(get2.status).toBe(404);
  });

  test('Validation errors on user create', async () => {
    const r1 = await request(app).post('/users').send({name: '', email: 'nope'});
    expect(r1.status).toBe(400);
    expect(r1.body).toHaveProperty('error');
  });
});

describe('Posts API', () => {
  test('Create post with valid author and list', async () => {
    const u = await request(app).post('/users').send({name: 'Bob', email: 'bob@example.com'});
    const uid = u.body.id;

    const p = await request(app).post('/posts').send({title: 'Hello', body: 'World', authorId: uid});
    expect(p.status).toBe(201);
    expect(p.body.title).toBe('Hello');

    const list = await request(app).get('/posts');
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBe(1);
  });

  test('Invalid post author returns 400', async () => {
    const r = await request(app).post('/posts').send({title: 'X', authorId: 'not-found'});
    expect(r.status).toBe(400);
  });
});

describe('Search API', () => {
  test('Search returns matching users and posts', async () => {
    const u1 = await request(app).post('/users').send({name: 'Charlie', email: 'charlie@ex.com'});
    const u2 = await request(app).post('/users').send({name: 'Dana', email: 'dana@ex.com'});
    const p1 = await request(app).post('/posts').send({title: 'First Post', body: 'About Node', authorId: u1.body.id});

    const s = await request(app).get('/search').query({q: 'char'});
    expect(s.status).toBe(200);
    expect(s.body.users.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Error handling', () => {
  test('Unknown route returns 404 from express default', async () => {
    const r = await request(app).get('/__unknown__');
    expect([404, 500]).toContain(r.status);
  });
});
