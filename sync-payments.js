// Script to synchronize payment statuses with booking statuses
require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');

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

const syncPaymentsWithBookings = async () => {
  try {
    console.log('Starting payment-booking synchronization...');
    
    // Find all payments
    const payments = await Payment.find();
    console.log(`Found ${payments.length} payments to check`);
    
    let updatedCount = 0;
    
    // Process each payment
    for (const payment of payments) {
      // Find the corresponding booking
      const booking = await Booking.findById(payment.booking);
      
      if (!booking) {
        console.log(`Warning: Payment ${payment._id} has no associated booking (booking ID: ${payment.booking})`);
        continue;
      }
      
      let needsUpdate = false;
      
      // Check if booking status needs to be updated based on payment status
      if (payment.status === 'succeeded' && booking.paymentStatus !== 'paid') {
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        needsUpdate = true;
        console.log(`Updating booking ${booking._id} to paid/confirmed status`);
      } else if (payment.status === 'refunded' && booking.paymentStatus !== 'refunded') {
        booking.paymentStatus = 'refunded';
        booking.status = 'cancelled';
        needsUpdate = true;
        console.log(`Updating booking ${booking._id} to refunded/cancelled status`);
      } else if (payment.status === 'failed' && booking.paymentStatus !== 'unpaid') {
        booking.paymentStatus = 'unpaid';
        booking.status = 'pending';
        needsUpdate = true;
        console.log(`Updating booking ${booking._id} to unpaid/pending status`);
      } else if (payment.status === 'pending' && booking.paymentStatus !== 'pending') {
        booking.paymentStatus = 'pending';
        booking.status = 'pending';
        needsUpdate = true;
        console.log(`Updating booking ${booking._id} to pending/pending status`);
      }
      
      // If booking needs update, save it
      if (needsUpdate) {
        await booking.save();
        updatedCount++;
      }
    }
    
    console.log(`Synchronization complete. Updated ${updatedCount} bookings.`);
    process.exit(0);
  } catch (error) {
    console.error('Error synchronizing payments with bookings:', error);
    process.exit(1);
  }
};

// Run the synchronization
syncPaymentsWithBookings();
