const mongoose = require('mongoose');

const PackageSuggestionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  // New fields for enhanced package details
  hostelType: {
    type: String,
    enum: ['Budget', 'Standard', 'Premium', 'Luxury', 'Other'],
    required: [true, 'Please specify hostel type']
  },
  hostelTypeDetails: {
    type: String,
    required: function() {
      return this.hostelType === 'Other';
    }
  },
  transportType: {
    type: String,
    enum: ['Economy Bus', 'Luxury Bus', 'Van', 'Car', 'Train', 'Other'],
    required: [true, 'Please specify transport type']
  },
  transportTypeDetails: {
    type: String,
    required: function() {
      return this.transportType === 'Other';
    }
  },
  mealPlan: {
    type: String,
    enum: ['Breakfast Only', 'Half Board', 'Full Board', 'All Inclusive', 'No Meals', 'Other'],
    required: [true, 'Please specify meal plan']
  },
  mealPlanDetails: {
    type: String,
    required: function() {
      return this.mealPlan === 'Other';
    }
  },
  activities: {
    type: [String],
    required: [true, 'Please add at least one activity']
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
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminFeedback: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PackageSuggestion', PackageSuggestionSchema);
