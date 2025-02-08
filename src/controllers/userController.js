const UserService = require('../services/userService');

class UserController {
  async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers(req.query);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error });
    }
  }

  async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user', error });
    }
  }

  async deleteUser(req, res) {
    const userId = req.params.id;

    try {
      await UserService.deleteUser(userId);
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting user', error });
    }
  }
}

module.exports = new UserController();
