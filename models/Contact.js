const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    maxlength: [20, 'Phone number cannot be more than 20 characters']
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
    maxlength: [100, 'Subject cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Please add a message'],
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  reply: {
    text: {
      type: String,
      default: ''
    },
    date: {
      type: Date
    },
    adminId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied'],
    default: 'unread'
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contact', ContactSchema);
