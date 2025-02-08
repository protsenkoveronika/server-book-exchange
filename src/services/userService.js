const User = require('../models/User');
const Book = require('../models/Book');

class UserService {
  async getUserById(userId) {
    return User.findById(userId).select('-password');
  }

  async getAllUsers() {
    return User.find().select('-password');
  }

  async getUserBooks(userId) {
    return Book.find({ owner: userId });
  }

  async deleteUser(userId) {
    await Book.deleteMany({ owner: userId });

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) throw new Error('User not found');

    return deletedUser;
  }

  async updateProfile(userId, { username, email, password }) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) throw new Error('Username already taken');
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) throw new Error('Email already taken');
      user.email = email;
    }

    if (password) user.password = password;

    await user.save();
    return { id: user._id, username: user.username, email: user.email };
  }

  async updateUser(userId, { username, email, role }) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) throw new Error('Username already taken');
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) throw new Error('Email already taken');
      user.email = email;
    }

    if (role) user.role = role;

    await user.save();
    return { message: user._id, username: user.username, email: user.email, role: user.role };
  }

  async checkEmailExists(email) {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return { exists: true };
    } else {
      return { exists: false };
    }
  }

  async checkUsernameExists(username) {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return { exists: true };
    } else {
      return { exists: false };
    }
  }
}

module.exports = new UserService();
