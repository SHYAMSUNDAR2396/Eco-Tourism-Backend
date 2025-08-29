const mongoose = require('mongoose');

const connectDB = (url) => {
  return mongoose.connect(url); // No need for extra options in Mongoose v6+
};

module.exports = connectDB;