const mongoose = require('mongoose');

const BusinessHourSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  open: {
    type: String,
    required: true
  },
  close: {
    type: String,
    required: true
  },
  isClosed: {
    type: Boolean,
    default: false
  }
});

const SiteSettingSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  businessHours: [BusinessHourSchema],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    },
    address: String
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String
  },
  logo: {
    type: String,
    default: 'default-logo.png'
  },
  favicon: {
    type: String,
    default: 'default-favicon.ico'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Only allow one site setting document
SiteSettingSchema.pre('save', async function(next) {
  const count = await this.constructor.countDocuments();
  if (count > 0 && !this.isNew) {
    // Allow updates to existing document
    this.updatedAt = Date.now();
    return next();
  } else if (count > 0 && this.isNew) {
    // Don't allow creating a new document if one already exists
    const error = new Error('Site settings already exist. Use update instead.');
    return next(error);
  }
  next();
});

module.exports = mongoose.model('SiteSetting', SiteSettingSchema);
