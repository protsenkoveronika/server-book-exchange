const Reservation = require('../models/Reservation');
const Book = require('../models/Book');

class ReservationService {
  async getReservationByBookId(bookId) {
    return Reservation.findOne({ book: bookId })
      .populate({
        path: 'book',
        select: 'name author location description photo status',
        populate: { path: 'owner', select: 'username contactPhone' },
      })
      .lean();
  }

  async getAllReservations() {
    return Reservation.find()
      .populate({
        path: 'book',
        select: 'name author location description photo status contactPhone',
        populate: { path: 'owner', select: 'username' },
      })
      .populate('reservedBy', 'username')
      .lean();
  }

  async reserveBook(bookId, reservationData, userId) {
    const book = await Book.findById(bookId);
    if (!book || book.status !== 'available') throw new Error('Book is not available');

    book.status = 'reserved';
    await book.save();

    return await Reservation.create({ ...reservationData, book: bookId, reservedBy: userId });
  }
}

module.exports = new ReservationService();
