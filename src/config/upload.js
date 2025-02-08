const express = require('express');
const router = express.Router();
const upload = require('../config/upload');

router.post('/upload', upload.single('image'), (req, res) => {
  res.send('File uploaded successfully');
});

module.exports = router;
