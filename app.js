require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db.js');
const authRoutes = require('./src/routes/authRoutes');
const bookRoutes = require('./src/routes/bookRoutes');
const reservationRoutes = require('./src/routes/reservationRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use('/auth', authRoutes);
app.use('/book', bookRoutes);
app.use('/reservation', reservationRoutes);
app.use('/admin', adminRoutes);

connectDB();

const PORT = process.env.PORT || 8000;

const srv = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
module.exports = { srv };
