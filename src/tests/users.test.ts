import http from 'node:http';
import request from 'supertest';

import { server } from '../server';
import {
  IUsersRepository,
  UsersRepository,
} from '../userRepository/usersRepository';

describe('users CRUD API', () => {
  let app: http.Server;
  let repo: IUsersRepository;

  beforeAll(() => {
    repo = new UsersRepository([]);
    app = server('127.0.0.1', 0, repo);
  });

  afterAll((done) => {
    app.close(() => done());
  });

  it('should perform full CRUD flow successfully', async () => {
    const getEmpty = await request(app).get('/users');
    expect(getEmpty.status).toBe(200);
    expect(getEmpty.body).toEqual([]);

    const createBody = {
      username: 'Jon Doe',
      age: 29,
      hobbies: ['gaming', 'books'],
    };

    const createRes = await request(app).post('/users').send(createBody);

    expect(createRes.status).toBe(201);
    const createdUser = createRes.body;

    expect(createdUser).toHaveProperty('id');
    expect(createdUser.username).toBe(createBody.username);
    expect(createdUser.age).toBe(createBody.age);
    expect(createdUser.hobbies).toEqual(createBody.hobbies);

    const userId = createdUser.id;

    const getById = await request(app).get(`/users/${userId}`);
    expect(getById.status).toBe(200);
    expect(getById.body).toEqual(createdUser);

    const updateBody = {
      username: 'John Updated',
      age: 31,
      hobbies: ['coding', 'reading'],
    };

    const updateRes = await request(app)
      .put(`/users/${userId}`)
      .send(updateBody);

    expect(updateRes.status).toBe(200);

    const updatedUser = updateRes.body;
    expect(updatedUser.id).toBe(userId);
    expect(updatedUser.username).toBe(updateBody.username);
    expect(updatedUser.age).toBe(updateBody.age);
    expect(updatedUser.hobbies).toEqual(updateBody.hobbies);

    const deleteRes = await request(app).delete(`/users/${userId}`);
    expect(deleteRes.status).toBe(204);

    const getDeleted = await request(app).get(`/users/${userId}`);
    expect(getDeleted.status).toBe(404);
  });

  it('should return 400 for invalid userId format', async () => {
    const invalidId = 'not-a-uuid';

    const getRes = await request(app).get(`/users/${invalidId}`);
    expect(getRes.status).toBe(400);

    const putRes = await request(app).put(`/users/${invalidId}`).send({
      username: 'Test PUT',
      age: 20,
      hobbies: [],
    });
    expect(putRes.status).toBe(400);

    const deleteRes = await request(app).delete(`/users/${invalidId}`);
    expect(deleteRes.status).toBe(400);
  });

  it('should return 400 for invalid request body (post, put)', async () => {
    const noUsernameRes = await request(app).post('/users').send({
      age: 25,
      hobbies: [],
    });
    expect(noUsernameRes.status).toBe(400);

    const wrongTypes = await request(app).post('/users').send({
      username: 'Jon Doe',
      age: '26',
      hobbies: '',
    });
    expect(wrongTypes.status).toBe(400);

    const createRes = await request(app).post('/users').send({
      username: 'Jon Doe',
      age: 52,
      hobbies: [],
    });

    expect(createRes.status).toBe(201);
    const userId = createRes.body.id;

    const invalidUpdate = await request(app).put(`/users/${userId}`).send({
      username: '',
      age: -1,
      hobbies: 'oops',
    });

    expect(invalidUpdate.status).toBe(400);
  });
});
