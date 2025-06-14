const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

// Import controllers
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getUserPosts,
  uploadMainImage,
  uploadSubImage
} = require('../controllers/post');

// Import middleware
const { protect } = require('../middleware/auth');
const { uploadPostImage: uploadImageMiddleware } = require('../middleware/postUpload');

// Routes for /api/posts
router
  .route('/')
  .post(
    protect,
    createPost
  )
  .get(getPosts);

// Routes for uploading post images
router.post('/upload-main-image', protect, uploadImageMiddleware, uploadMainImage);
router.post('/upload-sub-image', protect, uploadImageMiddleware, uploadSubImage);

// Legacy route for backward compatibility
router.post('/upload-image', protect, uploadImageMiddleware, uploadMainImage); // Reuse the uploadMainImage handler

// Routes for specific post
router
  .route('/:id')
  .get(getPost)
  .put(protect, uploadImageMiddleware, updatePost)
  .delete(protect, deletePost);

// Like/unlike routes
router.put('/like/:id', protect, likePost);
router.put('/unlike/:id', protect, unlikePost);

// Get posts by user
router.get('/user/:userId', getUserPosts);

module.exports = router;
