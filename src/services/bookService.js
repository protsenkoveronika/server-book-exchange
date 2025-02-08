const path = require('path');
const fs = require('fs');
const Book = require('../models/Book');
const Reservation = require('../models/Reservation');

class BookService {
  async getAllBooks(query) {
    const { name, author } = query;
    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (author) filter.author = { $regex: author, $options: 'i' };
    const books = await Book.find(filter).populate('owner', 'username');
    return books.map((book) => ({
      ...book._doc,
      photo: book.photo ? `http://localhost:8000/${book.photo}` : null,
    }));
  }

  async getBookById(bookId) {
    const book = await Book.findById(bookId).populate('owner', 'username contactPhone').lean();

    if (!book) return null;

    let reservation = null;
    if (book.status === 'reserved') {
      const foundReservation = await Reservation.findOne({ book: bookId }).lean();
      if (foundReservation) {
        reservation = {
          firstName: foundReservation.firstName,
          lastName: foundReservation.lastName,
          address: foundReservation.address,
          phoneNumber: foundReservation.phoneNumber,
        };
      }
    }

    const response = {
      id: book._id,
      name: book.name,
      author: book.author,
      location: book.location,
      description: book.description,
      photo: book.photo ? `http://localhost:8000/${book.photo}` : null,
      status: book.status,
      createdAt: book.createdAt,
      owner: {
        _id: book.owner._id,
        username: book.owner.username,
        contactPhone: book.contactPhone,
      },
      reservation: reservation,
    };
    return response;
  }

  async createBook(bookData, ownerId) {
    return await Book.create({ ...bookData, owner: ownerId });
  }

  async updateBook(bookId, bookData, userId, userRole) {
    const book = await Book.findById(bookId);
    if (!book) throw new Error('Book not found');
    if (book.owner.toString() !== userId && userRole !== 'admin') throw new Error('Unauthorized');

    if (bookData.photo && book.photo) {
      const oldPhotoPath = path.join(
        __dirname,
        '..',
        '..',
        book.photo.replace('http://localhost:8000/', '')
      );

      if (fs.existsSync(oldPhotoPath)) {
        try {
          fs.unlinkSync(oldPhotoPath);
        } catch (err) {
          console.error('Error deleting old photo:', err);
        }
      } else {
        console.warn('Old photo file not found, skipping delete.');
      }
    }

    if (bookData.photo) book.photo = bookData.photo;

    return Book.findByIdAndUpdate(bookId, bookData, { new: true });
  }

  async deleteBook(bookId, userId, userRole) {
    console.log('Attempting to delete book with ID:', bookId);

    const book = await Book.findById(bookId);
    if (!book) throw new Error('Book not found');

    if (book.owner.toString() !== userId && userRole !== 'admin') {
      throw new Error('Unauthorized');
    }

    if (book.photo) {
      const photoPath = path.join(__dirname, '..', '..', book.photo);
      fs.unlink(photoPath, (err) => {
        if (err) console.error('Error deleting photo:', err);
      });
    }

    await Reservation.deleteMany({ book: bookId });
    return Book.findByIdAndDelete(bookId);
  }

  async getBooksByOwner(ownerId) {
    const books = await Book.find({ owner: ownerId }).populate('owner', 'username email');
    return books.map((book) => ({
      ...book._doc,
      photo: book.photo ? `http://localhost:8000/${book.photo}` : null,
    }));
  }

  async getUserReservations(userId) {
    const reservations = await Reservation.find({ reservedBy: userId })
      .populate({
        path: 'book',
        select: 'name author location description photo status',
        populate: { path: 'owner', select: 'username' },
      })
      .lean();

    return reservations.map((reservation) => ({
      id: reservation._id,
      book: {
        id: reservation.book._id,
        name: reservation.book.name,
        author: reservation.book.author,
        location: reservation.book.location,
        description: reservation.book.description,
        photo: reservation.book.photo ? `http://localhost:8000/${reservation.book.photo}` : null,
        status: reservation.book.status,
        owner: reservation.book.owner.username,
      },
      reservedAt: reservation.createdAt,
      firstName: reservation.firstName,
      lastName: reservation.lastName,
      address: reservation.address,
      phoneNumber: reservation.phoneNumber,
    }));
  }
}

module.exports = new BookService();
