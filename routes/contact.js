const express = require('express');
const { check } = require('express-validator');
const { 
  createContact, 
  getContacts, 
  getContact, 
  updateContactStatus, 
  deleteContact,
  replyToContact,
  getUserContacts
} = require('../controllers/contact');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes - all routes below require authentication
router.use(protect);

// User routes
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone', 'Phone number is required').not().isEmpty(),
    check('subject', 'Subject is required').not().isEmpty(),
    check('message', 'Message is required').not().isEmpty()
  ],
  createContact
);

router.get('/user', getUserContacts);

// Admin only routes
router.use(authorize('admin'));

router.route('/')
  .get(getContacts);

router.route('/:id')
  .get(getContact)
  .put(updateContactStatus)
  .delete(deleteContact);

router.put('/:id/reply', replyToContact);

module.exports = router;
