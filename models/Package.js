const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  desc: {
    type: String,
    required: [true, 'Please add a description']
  },
  img: {
    type: String,
    required: [true, 'Please add a main image URL']
  },
  startPoint: {
    type: String,
    required: [true, 'Please add a starting point']
  },
  destinations: {
    type: [String],
    required: [true, 'Please add at least one destination']
  },
  duration: {
    type: String,
    required: [true, 'Please add tour duration']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: 4.5
  },
  coordinates: [{
    place: {
      type: String,
      required: true
    },
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  }],
  images: {
    type: [String],
    required: [true, 'Please add at least one image']
  },
  itinerary: [{
    day: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  active: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Package', PackageSchema);