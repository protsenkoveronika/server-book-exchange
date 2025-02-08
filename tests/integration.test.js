const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { srv } = require('../app');
const User = require('../src/models/User');

let server;
let token;
let testUser;
let book;

const generateToken = async (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

beforeAll(async () => {
  server = srv;

  testUser = new User({
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'password123',
  });
  await testUser.save();

  token = await generateToken(testUser);

  const bookResponse = await request(server)
    .post('/new')
    .set('Authorization', `Bearer ${token}`)
    .attach('photo', './uploads/1735129157771-hp.jpg')
    .field('name', 'Reservation Test Book')
    .field('author', 'Test Author')
    .field('owner', testUser._id.toString()) // Use the saved user's ID
    .field('description', 'A book to test reservations')
    .field('location', 'New York')
    .field('contactPhone', '1234567890');

  // Store the created book for later use
  book = bookResponse.body;
  // console.log('Generated Token:', token);
});

// afterEach(async () => {
//   const collections = mongoose.connection.collections;
//   for (const key in collections) {
//     await collections[key].deleteMany({});
//   }
// });

afterAll(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  await mongoose.connection.close();
  server.close();
});

describe('Auth API', () => {
  it('should fail registration if username or email is already taken', async () => {
    const response = await request(server).post('/register').send({
      username: 'testuser',
      email: 'newemail@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Username or email already taken');
  });

  it('should register a new user', async () => {
    const response = await request(server).post('/register').send({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.username).toBe('newuser');
  });

  it('should fail login with incorrect credentials', async () => {
    const response = await request(server).post('/login').send({
      email: 'testuser@example.com',
      password: 'wrongpassword',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });

  it('should login an existing user', async () => {
    const response = await request(server).post('/login').send({
      email: 'testuser@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.username).toBe('testuser');
  });

  it('should fetch user profile with valid token', async () => {
    const response = await request(server).get('/profile').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.username).toBe('testuser');
    expect(response.body.email).toBe('testuser@example.com');
  });

  it('should fail fetching profile without token', async () => {
    const response = await request(server).get('/profile');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('should logout successfully', async () => {
    const response = await request(server).post('/logout').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Successfully logged out');
  });

  it('should fail logout with invalid token', async () => {
    const response = await request(server)
      .post('/logout')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid or expired token');
  });
});

describe('Book API', () => {
  it('should create a new book', async () => {
    const response = await request(server)
      .post('/new')
      .set('Authorization', `Bearer ${token}`)
      .attach('photo', './uploads/1735129157771-hp.jpg')
      .field('name', 'Test Book')
      .field('author', 'Test Author')
      .field('owner', testUser._id.toString())
      .field('description', 'A book for testing purposes')
      .field('location', 'New York')
      .field('contactPhone', '1234567890');

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Test Book');
  });

  it('should fetch all books', async () => {
    const res = await request(server).get('/');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Reservation API', () => {
  it('should return 400 if any field is missing', async () => {
    const response = await request(server)
      .post(`/reserve/${book._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All fields are required');
  });

  it('should reserve a book successfully', async () => {
    const response = await request(server)
      .post(`/reserve/${book._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main Street',
        phoneNumber: '1234567890',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('reservation');
    expect(response.body.reservation.book).toBe(book._id);
    expect(response.body.reservation.reservedBy).toBe(testUser._id.toString());
    expect(response.body.reservation.firstName).toBe('John');
    expect(response.body.reservation.lastName).toBe('Doe');
  });
});
