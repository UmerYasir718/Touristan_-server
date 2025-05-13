const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the review'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  text: {
    type: String,
    required: [true, 'Please add review text']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please add a rating between 1 and 5']
  },
  packageId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Package',
    required: true
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  images: [String],
  approved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', ReviewSchema);