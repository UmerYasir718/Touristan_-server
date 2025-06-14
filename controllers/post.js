const Post = require("../models/Post");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const { validationResult } = require("express-validator");

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    // Debug: Log the entire request body to see what's coming in
    console.log("Request body in controller:", req.body);

    // Get content from request body
    let postContent = req.body.content;

    // Check if content is provided
    if (!postContent || postContent.trim() === "") {
      return res.status(400).json({
        success: false,
        errors: [{ msg: "Content is required" }],
      });
    }

    // Validate content length
    if (postContent.length > 1000) {
      return res.status(400).json({
        success: false,
        errors: [{ msg: "Content cannot exceed 1000 characters" }],
      });
    }

    // Create post object
    const postData = {
      user: req.user.id,
      content: postContent,
    };

    // If main image URL was provided, add it to the post data
    if (req.body.image) {
      postData.image = req.body.image;
      console.log("Main image URL added to post:", req.body.image);
    }

    // If sub images were provided, store them in the database
    if (req.body.subImages && Array.isArray(req.body.subImages)) {
      postData.subImages = req.body.subImages;
      console.log("Sub images added to post:", req.body.subImages);
    }

    // Create post
    const post = await Post.create(postData);

    // Populate user data for response
    const populatedPost = await Post.findById(post._id).populate(
      "user",
      "name profileImage"
    );

    res.status(201).json({
      success: true,
      data: populatedPost,
    });
  } catch (err) {
    console.error("Error creating post:", err);
    next(err);
  }
};

// @desc    Upload main image for a post
// @route   POST /api/posts/upload-main-image
// @access  Private
exports.uploadMainImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        errors: [{ msg: "Please upload a main image" }],
      });
    }

    // Return the Cloudinary URL of the uploaded main image
    res.status(200).json({
      success: true,
      imageUrl: req.file.path,
    });
  } catch (err) {
    console.error("Error uploading main image:", err);
    next(err);
  }
};

// @desc    Upload sub image for a post
// @route   POST /api/posts/upload-sub-image
// @access  Private
exports.uploadSubImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        errors: [{ msg: "Please upload a sub image" }],
      });
    }

    // Return the Cloudinary URL of the uploaded sub image
    res.status(200).json({
      success: true,
      imageUrl: req.file.path,
    });
  } catch (err) {
    console.error("Error uploading sub image:", err);
    next(err);
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Post.countDocuments();

    // Find posts with pagination
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // Newest first
      .skip(startIndex)
      .limit(limit)
      .populate("user", "name profileImage")
      .populate("likes.user", "name profileImage");

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: posts.length,
      pagination,
      data: posts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "name profileImage")
      .populate("likes.user", "name profileImage");

    if (!post) {
      return next(
        new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return next(
        new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is post owner
    if (post.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this post`,
          401
        )
      );
    }

    // Only allow content to be updated
    const { content } = req.body;
    if (content) {
      post.content = content;
    }

    // If a new image was uploaded, update it
    if (req.body.image) {
      post.image = req.body.image;
    }

    await post.save();

    // Populate user data for response
    post = await Post.findById(post._id)
      .populate("user", "name profileImage")
      .populate("likes.user", "name profileImage");

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(
        new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is post owner or admin
    if (post.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this post`,
          401
        )
      );
    }

    // If post has an image, we could delete it from Cloudinary here
    // This would require extracting the public_id from the URL

    await post.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Like a post
// @route   PUT /api/posts/like/:id
// @access  Private
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(
        new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if the post has already been liked by this user
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return next(new ErrorResponse("Post already liked", 400));
    }

    // Add user to likes array
    post.likes.unshift({ user: req.user.id });
    await post.save();

    // Populate user data for response
    const updatedPost = await Post.findById(post._id)
      .populate("user", "name profileImage")
      .populate("likes.user", "name profileImage");

    res.status(200).json({
      success: true,
      data: updatedPost,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Unlike a post
// @route   PUT /api/posts/unlike/:id
// @access  Private
exports.unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(
        new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if the post has not yet been liked by this user
    if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
      return next(new ErrorResponse("Post has not yet been liked", 400));
    }

    // Remove user from likes array
    post.likes = post.likes.filter(
      (like) => like.user.toString() !== req.user.id
    );
    await post.save();

    // Populate user data for response
    const updatedPost = await Post.findById(post._id)
      .populate("user", "name profileImage")
      .populate("likes.user", "name profileImage");

    res.status(200).json({
      success: true,
      data: updatedPost,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get posts by user
// @route   GET /api/posts/user/:userId
// @access  Public
exports.getUserPosts = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Post.countDocuments({ user: req.params.userId });

    // Find posts with pagination
    const posts = await Post.find({ user: req.params.userId })
      .sort({ createdAt: -1 }) // Newest first
      .skip(startIndex)
      .limit(limit)
      .populate("user", "name profileImage")
      .populate("likes.user", "name profileImage");

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: posts.length,
      pagination,
      data: posts,
    });
  } catch (err) {
    next(err);
  }
};
