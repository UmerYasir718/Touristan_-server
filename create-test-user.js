// Script to create a test user with sample data
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Package = require('./models/Package');

// Connect to database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1);
});

const createTestUser = async () => {
  try {
    console.log('Creating test user and sample data...');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'ali@example.com' });
    
    let user;
    if (existingUser) {
      console.log('Test user already exists. Updating instead of creating...');
      
      // Update user details
      existingUser.name = 'Ali Ahmed';
      existingUser.phone = '+92 300 1234567';
      existingUser.status = 'active';
      existingUser.lastLogin = new Date('2025-04-29');
      
      await existingUser.save();
      console.log('User updated successfully');
      
      // We'll still create the sample bookings
      user = existingUser;
    } else {
      // Create new user
      user = await User.create({
        name: 'Ali Ahmed',
        email: 'ali@example.com',
        password: 'password123',
        phone: '+92 300 1234567',
        role: 'user',
        status: 'active',
        lastLogin: new Date('2025-04-29'),
        createdAt: new Date('2025-01-15')
      });
      
      console.log('User created successfully');
    }
    
    // Get or create sample packages
    const packages = [
      {
        title: 'Swat Valley Adventure',
        description: 'Experience the natural beauty of Swat Valley',
        price: 15000,
        duration: 5,
        img: 'https://res.cloudinary.com/dngm7icac/image/upload/v1/packages/swat_valley.jpg'
      },
      {
        title: 'Hunza Valley Tour',
        description: 'Discover the wonders of Hunza Valley',
        price: 30000,
        duration: 7,
        img: 'https://res.cloudinary.com/dngm7icac/image/upload/v1/packages/hunza_valley.jpg'
      },
      {
        title: 'Murree Weekend Getaway',
        description: 'Enjoy a relaxing weekend in Murree',
        price: 8000,
        duration: 2,
        img: 'https://res.cloudinary.com/dngm7icac/image/upload/v1/packages/murree.jpg'
      }
    ];
    
    // Create packages if they don't exist
    for (const packageData of packages) {
      const existingPackage = await Package.findOne({ title: packageData.title });
      if (!existingPackage) {
        await Package.create(packageData);
        console.log(`Package "${packageData.title}" created`);
      }
    }
    
    // Get user and packages for creating bookings
    const testUser = await User.findOne({ email: 'ali@example.com' });
    const swatPackage = await Package.findOne({ title: 'Swat Valley Adventure' });
    const hunzaPackage = await Package.findOne({ title: 'Hunza Valley Tour' });
    const murreePackage = await Package.findOne({ title: 'Murree Weekend Getaway' });
    
    // Delete existing bookings for this user to avoid duplicates
    await Booking.deleteMany({ user: testUser._id });
    
    // Create sample bookings
    const bookings = [
      {
        package: swatPackage._id,
        user: testUser._id,
        packageName: swatPackage.title,
        packageImage: swatPackage.img,
        travelDate: new Date('2025-05-15'),
        travelers: 2,
        customerName: testUser.name,
        customerEmail: testUser.email,
        customerPhone: testUser.phone,
        totalAmount: swatPackage.price * 2,
        status: 'confirmed',
        paymentStatus: 'paid',
        createdAt: new Date('2025-04-20')
      },
      {
        package: hunzaPackage._id,
        user: testUser._id,
        packageName: hunzaPackage.title,
        packageImage: hunzaPackage.img,
        travelDate: new Date('2025-06-10'),
        travelers: 3,
        customerName: testUser.name,
        customerEmail: testUser.email,
        customerPhone: testUser.phone,
        totalAmount: hunzaPackage.price * 3,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date('2025-04-25')
      },
      {
        package: murreePackage._id,
        user: testUser._id,
        packageName: murreePackage.title,
        packageImage: murreePackage.img,
        travelDate: new Date('2025-04-05'),
        travelers: 4,
        customerName: testUser.name,
        customerEmail: testUser.email,
        customerPhone: testUser.phone,
        totalAmount: murreePackage.price * 4,
        status: 'completed',
        paymentStatus: 'paid',
        createdAt: new Date('2025-03-15')
      }
    ];
    
    // Create bookings
    for (const bookingData of bookings) {
      await Booking.create(bookingData);
    }
    
    console.log('Sample bookings created successfully');
    console.log('Test data creation complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
};

// Run the script
createTestUser();
