const ReservationController = require('../src/controllers/reservationController');
const ReservationService = require('../src/services/reservationService');
const BookController = require('../src/controllers/bookController');
const BookService = require('../src/services/bookService');
const AuthController = require('../src/controllers/authController');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

jest.mock('../src/models/User');
jest.mock('jsonwebtoken');

describe('AuthController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return 400 if username or email is already taken', async () => {
      User.findOne.mockResolvedValue({ username: 'test' });

      const req = { body: { username: 'test', email: 'test@test.com', password: 'password123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AuthController.register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ username: 'test' }, { email: 'test@test.com' }],
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Username or email already taken' });
    });

    it('should return 201 and create a user', async () => {
      User.findOne.mockResolvedValue(null);
      User.prototype.save = jest.fn().mockResolvedValue();
      jwt.sign.mockReturnValue('mockToken');

      const req = { body: { username: 'test', email: 'test@test.com', password: 'password123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AuthController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        token: 'mockToken',
        user: { id: undefined, username: 'test', email: 'test@test.com', role: undefined },
      });
    });
  });

  describe('login', () => {
    it('should return 404 if user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      const req = { body: { email: 'test@test.com', password: 'password123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 401 if password is incorrect', async () => {
      const mockUser = { comparePassword: jest.fn().mockResolvedValue(false) };
      User.findOne.mockResolvedValue(mockUser);

      const req = { body: { email: 'test@test.com', password: 'wrongPassword' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AuthController.login(req, res);

      expect(mockUser.comparePassword).toHaveBeenCalledWith('wrongPassword');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });
  });
});

jest.mock('../src/services/bookService');

describe('BookController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllBooks', () => {
    it('should return books successfully', async () => {
      BookService.getAllBooks.mockResolvedValue([{ id: 1, name: 'Test Book' }]);

      const req = { query: {} };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await BookController.getAllBooks(req, res);

      expect(BookService.getAllBooks).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith([{ id: 1, name: 'Test Book' }]);
    });
  });

  describe('createBook', () => {
    it('should return 400 if no photo is provided', async () => {
      const req = { body: { name: 'Test Book' }, file: null };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await BookController.createBook(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Photo is required' });
    });

    it('should create a book successfully', async () => {
      BookService.createBook.mockResolvedValue({ id: 1, name: 'Test Book' });

      const req = {
        body: { name: 'Test Book' },
        file: { path: 'photoPath' },
        user: { id: 'userId' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await BookController.createBook(req, res);

      expect(BookService.createBook).toHaveBeenCalledWith(
        { name: 'Test Book', photo: 'photoPath' },
        'userId'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Test Book' });
    });
  });
});

jest.mock('../src/services/reservationService');

describe('ReservationController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('reserveBook', () => {
    it('should return 400 if any field is missing', async () => {
      const req = { params: { bookId: 'bookId' }, body: {}, user: { id: 'userId' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await ReservationController.reserveBook(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });

    it('should reserve a book successfully', async () => {
      ReservationService.reserveBook.mockResolvedValue({ id: 'reservationId' });

      const req = {
        params: { bookId: 'bookId' },
        body: { firstName: 'John', lastName: 'Doe', address: '123 St', phoneNumber: '1234567890' },
        user: { id: 'userId' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await ReservationController.reserveBook(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Book reserved successfully',
        reservation: { id: 'reservationId' },
      });
    });
  });
});
