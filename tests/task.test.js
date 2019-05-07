const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const { userOneId, userOne, userTwo, taskOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'task from test'
        })
        .expect(201);

    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false);
});

test('should not create task if description is not passed', async () => {
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(400);
});

test('should fetch user tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const tasks = response.body;
    expect(tasks.length).toEqual(2);
});

test('should delete users tasks', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const task = await Task.findById(taskOne._id);
    expect(task).toBeNull();
});

test('should not delete other users tasks', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404);

    const task = await Task.findById(taskOne._id);
    expect(task).not.toBeNull();
});