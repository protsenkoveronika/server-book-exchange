const ReservationService = require('../services/reservationService');

class ReservationController {
  async reserveBook(req, res) {
    try {
      const { bookId } = req.params;
      const { firstName, lastName, address, phoneNumber } = req.body;

      if (!firstName || !lastName || !address || !phoneNumber) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const reservation = await ReservationService.reserveBook(
        bookId,
        { firstName, lastName, address, phoneNumber },
        req.user.id
      );

      res.status(201).json({
        message: 'Book reserved successfully',
        reservation,
      });
    } catch (error) {
      console.error(error.message);
      res.status(400).json({ message: error.message });
    }
  }

  async getAllReservations(req, res) {
    try {
      const reservations = await ReservationService.getAllReservations();

      if (!reservations || reservations.length === 0) {
        return res.status(404).json({ message: 'No reservations found' });
      }

      res.status(200).json(reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error.message);
      res.status(500).json({ message: 'Error fetching reservation data.' });
    }
  }

  async getBookReservation(req, res) {
    try {
      const { bookId } = req.params;
      const reservation = await ReservationService.getReservationByBookId(bookId);

      if (!reservation) {
        return res.status(404).json({ message: 'No reservation found for this book.' });
      }

      res.status(200).json(reservation);
    } catch (error) {
      console.error('Error fetching reservation:', error.message);
      res.status(500).json({ message: 'Error fetching reservation data.' });
    }
  }
}

module.exports = new ReservationController();
