const Contact = require('../models/Contact');
const ErrorResponse = require('../utils/errorResponse');
const { validationResult } = require('express-validator');

// @desc    Create new contact message
// @route   POST /api/contact
// @access  Private
exports.createContact = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Add userId from authenticated user
    const contactData = {
      ...req.body,
      userId: req.user.id
    };

    const contact = await Contact.create(contactData);

    res.status(201).json({
      success: true,
      data: contact
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
exports.getContacts = async (req, res, next) => {
  try {
    // Add query parameters for filtering
    const query = {};
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Sort by date (newest first by default)
    const sort = req.query.sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const contacts = await Contact.find(query).sort(sort);

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single contact message
// @route   GET /api/contact/:id
// @access  Private/Admin
exports.getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return next(
        new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update contact message status
// @route   PUT /api/contact/:id
// @access  Private/Admin
exports.updateContactStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!status || !['unread', 'read', 'replied'].includes(status)) {
      return next(
        new ErrorResponse('Please provide a valid status (unread, read, or replied)', 400)
      );
    }

    let contact = await Contact.findById(req.params.id);

    if (!contact) {
      return next(
        new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404)
      );
    }

    // Update status
    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return next(
        new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404)
      );
    }

    await contact.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reply to contact message
// @route   PUT /api/contact/:id/reply
// @access  Private/Admin
exports.replyToContact = async (req, res, next) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Reply text is required'
      });
    }
    
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }
    
    // Update contact with reply
    contact.reply = {
      text,
      date: Date.now(),
      adminId: req.user.id
    };
    contact.status = 'replied';
    
    await contact.save();
    
    // Send email notification to user
    if (contact.email) {
      try {
        const sendEmail = require('../utils/sendEmail');
        const { contactReplyTemplate } = require('../utils/emailTemplates');
        
        await sendEmail({
          email: contact.email,
          subject: `Response to your inquiry: ${contact.subject}`,
          html: contactReplyTemplate(contact)
        });
      } catch (emailError) {
        console.error('Error sending reply notification email:', emailError);
        // Continue even if email fails
      }
    }
    
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's contact messages
// @route   GET /api/contact/user
// @access  Private
exports.getUserContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (err) {
    next(err);
  }
};
