const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Import controllers
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser
} = require('../controllers/users');

// Protect all routes below
router.use(protect);

// Admin only routes
router.use(authorize('admin'));

// User management routes
router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.put('/:id/status', updateUserStatus);

module.exports = router;