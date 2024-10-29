const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
// Render the login page
exports.getregisterPage = (req, res) => {
  res.render('registerPage');
};
exports.register = (req, res) => {

  const { email, password } = req.body;

  // Check if user already exists
  User.findByEmail(email, (err, results) => {
    if (results.length > 0) {
      return res.status(400).send('User already exists');
    }

    // Generate verification token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Create new user with hashed password
    const hashedPassword = bcrypt.hashSync(password, 8); // Hash the password
    User.create({ email, password: hashedPassword, token }, (err) => {
      if (err) throw err;

      // Send verification email
      const transporter = nodemailer.createTransport({
        service: 'gmail', // or your email provider
        auth: {
          user: process.env.EMAIL_USER, // Your email
          pass: process.env.EMAIL_PASSWORD // Your email password
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email, // The user's email address
        subject: 'Email Verification',
        text: `Please verify your email by clicking the link: 
        http://localhost:3000/auth/verify?token=${token}`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).send(error.toString());
        }
        res.send('User registered! Check your email for verification.');
      });
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findByEmail(email, (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).send('Invalid email or password');
    }

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send('Invalid email or password');
    }

    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ auth: true, token });
  });
};

exports.verify = (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).send('No token provided');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).send('Failed to verify token');
    }

    // Update the user's status to verified in the database
    User.verifyEmail(decoded.email, (err) => { // Assuming you have a method in User model to update verification status
      if (err) {
        return res.status(500).send('Error updating verification status');
      }
      res.send('Email verified successfully');
    });
  });
};
    