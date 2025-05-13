const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SiteSetting = require('../models/SiteSetting');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Default business hours
const defaultBusinessHours = [
  { day: 'Monday', open: '09:00', close: '17:00', isClosed: false },
  { day: 'Tuesday', open: '09:00', close: '17:00', isClosed: false },
  { day: 'Wednesday', open: '09:00', close: '17:00', isClosed: false },
  { day: 'Thursday', open: '09:00', close: '17:00', isClosed: false },
  { day: 'Friday', open: '09:00', close: '17:00', isClosed: false },
  { day: 'Saturday', open: '10:00', close: '15:00', isClosed: false },
  { day: 'Sunday', open: '00:00', close: '00:00', isClosed: true }
];

// Default site settings
const defaultSettings = {
  businessName: 'TouriStan',
  address: 'Islamabad, Pakistan',
  phone: '+92-XXX-XXXXXXX',
  email: 'info@touristan.com',
  businessHours: defaultBusinessHours,
  location: {
    type: 'Point',
    coordinates: [73.0479, 33.6844], // Islamabad coordinates
    address: 'Islamabad, Pakistan'
  },
  socialMedia: {
    facebook: 'https://facebook.com/touristan',
    twitter: 'https://twitter.com/touristan',
    instagram: 'https://instagram.com/touristan',
    linkedin: 'https://linkedin.com/company/touristan',
    youtube: 'https://youtube.com/touristan'
  },
  logo: 'https://res.cloudinary.com/dngm7icac/image/upload/v1/packages/default-logo',
  favicon: 'https://res.cloudinary.com/dngm7icac/image/upload/v1/packages/default-favicon'
};

// Create default settings
const createDefaultSettings = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if settings already exist
    const existingSettings = await SiteSetting.findOne();

    if (existingSettings) {
      console.log('Site settings already exist in the database');
      console.log(existingSettings);
      process.exit(0);
    }

    // Create default settings
    const siteSettings = await SiteSetting.create(defaultSettings);

    console.log('Default site settings created:');
    console.log(JSON.stringify(siteSettings, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error(`Error creating default settings: ${error.message}`);
    process.exit(1);
  }
};

// Run the function
createDefaultSettings();
