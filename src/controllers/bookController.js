const BookService = require('../services/bookService');

class BookController {
  async getAllBooks(req, res) {
    try {
      const books = await BookService.getAllBooks(req.query);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching books', error });
    }
  }

  async createBook(req, res) {
    try {
      const { name, author, location, description, contactPhone } = req.body;
      const photo = req.file ? req.file.path : null;

      if (!photo) {
        return res.status(400).json({ message: 'Photo is required' });
      }

      const bookData = { name, author, location, description, contactPhone, photo };
      const book = await BookService.createBook(bookData, req.user.id);

      res.status(201).json(book);
    } catch (error) {
      res.status(400).json({ message: 'Error creating book', error: error.message });
    }
  }

  async updateBook(req, res) {
    try {
      const bookData = req.body;
      const userRole = req.user.role;

      if (req.file) {
        bookData.photo = req.file.path;
      }

      const updatedBook = await BookService.updateBook(
        req.params.id,
        bookData,
        req.user.id,
        userRole
      );
      res.json(updatedBook);
    } catch (error) {
      console.error('Error in updateBook:', error);
      res.status(400).json({ message: 'Error updating book', error: error.message });
    }
  }

  async deleteBook(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      await BookService.deleteBook(req.params.id, userId, userRole);
      res.json({ message: 'Book deleted successfully' });
    } catch (error) {
      console.error('Error in deleteBook:', error);
      res.status(400).json({ message: 'Error deleting book', error });
    }
  }

  async getUserBooks(req, res) {
    try {
      const userId = req.user.id;
      const books = await BookService.getBooksByOwner(userId);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user books', error: error.message });
    }
  }

  async getBookDetails(req, res) {
    try {
      const bookId = req.params.id;
      const userId = req.user ? req.user.id : null;

      const book = await BookService.getBookById(bookId, userId);

      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      res.json(book);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching book details', error: error.message });
    }
  }
  async getUserReservations(req, res) {
    try {
      const userId = req.user.id;
      const reservations = await BookService.getUserReservations(userId);
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching user reservations:', error.message);
      res.status(500).json({ message: 'Error fetching user reservations', error: error.message });
    }
  }
}

module.exports = new BookController();
