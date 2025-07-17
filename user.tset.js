const request = require('supertest');
const express = require('express');
const app = require('./src/app');
const mongoose = require('mongoose');
const User = require('./userModel');

// Mock MongoDB connection for isolated testing
beforeAll(async () => {
  const mongoUri = 'mongodb://127.0.0.1:27017/testDB';
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

// Clean DB after each test
afterEach(async () => {
  await User.deleteMany();
});

// Close DB after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('User API', () => {
  const testUser = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123'
  };

  test('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toHaveProperty('email', testUser.email);
  });

  test('should not register a user with an existing email', async () => {
    await new User(testUser).save(); // Insert user manually

    const res = await request(app)
      .post('/api/users/register')
      .send(testUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Email already exists/i);
  });

  test('should login user and return token', async () => {
    // Register user first
    await request(app).post('/api/users/register').send(testUser);

    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toHaveProperty('email', testUser.email);
  });

  test('should reject login with invalid password', async () => {
    await request(app).post('/api/users/register').send(testUser);

    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: testUser.email,
        password: 'wrongPassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
