const db = require('../config/db'); // Adjust this according to your db configuration
const bcrypt = require('bcryptjs');

const User = {
  create: (userData, callback) => {
    const query = 'INSERT INTO users (email, password, token) VALUES (?, ?, ?)';
    const hashedPassword = bcrypt.hashSync(userData.password, 8); // Hash the password
    db.query(query, [userData.email, hashedPassword, userData.token], callback);
  },

  findByEmail: (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], callback);
  },

  // New method to verify the user's email
  verifyEmail: (email, callback) => {
    const query = 'UPDATE users SET verified = ? WHERE email = ?';
    db.query(query, [true, email], callback); // Set verified to true
  }
};

module.exports = User;
