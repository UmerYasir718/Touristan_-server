const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const ErrorResponse = require('../utils/errorResponse');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Cloudinary storage with timeout for package suggestions
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'package-suggestions',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, crop: 'limit' }],
    // Set Cloudinary upload timeout
    timeout: 15000 // 15 seconds timeout for Cloudinary upload
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allow only image files
  const filetypes = /jpeg|jpg|png|webp/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5000000, // 5MB max file size
    fieldSize: 5 * 1024 * 1024 // 5MB field size limit
  },
  fileFilter: fileFilter
});

// Middleware for handling package suggestion image uploads
exports.uploadSuggestionImage = (req, res, next) => {
  const uploadSingle = upload.single('image');

  // Set a timeout for the multer upload
  const uploadTimeout = setTimeout(() => {
    return next(new ErrorResponse('Image upload timed out. Please try again with a smaller image or check your connection.', 408));
  }, 20000); // 20 seconds timeout

  uploadSingle(req, res, function (err) {
    // Clear the timeout since the upload completed (either success or error)
    clearTimeout(uploadTimeout);
    
    if (err instanceof multer.MulterError) {
      // A Multer error occurred during upload
      return next(new ErrorResponse(`Upload error: ${err.message}`, 400));
    } else if (err) {
      // An unknown error occurred
      return next(new ErrorResponse(`Error: ${err.message}`, 400));
    }
    
    // If no file was uploaded, continue without error
    if (!req.file) {
      return next();
    }
    
    // Add Cloudinary secure URL to request body
    req.body.img = req.file.path;
    
    next();
  });
};

// Middleware for handling multiple package suggestion images upload
exports.uploadSuggestionImages = (req, res, next) => {
  const uploadMultiple = upload.array('images', 10); // Allow up to 10 images

  // Set a timeout for the multer upload
  const uploadTimeout = setTimeout(() => {
    return next(new ErrorResponse('Images upload timed out. Please try again with smaller images or fewer images.', 408));
  }, 30000); // 30 seconds timeout for multiple images

  uploadMultiple(req, res, function (err) {
    // Clear the timeout since the upload completed (either success or error)
    clearTimeout(uploadTimeout);
    
    if (err instanceof multer.MulterError) {
      // A Multer error occurred during upload
      return next(new ErrorResponse(`Upload error: ${err.message}`, 400));
    } else if (err) {
      // An unknown error occurred
      return next(new ErrorResponse(`Error: ${err.message}`, 400));
    }
    
    // If no files were uploaded, continue without error
    if (!req.files || req.files.length === 0) {
      return next();
    }
    
    // Add Cloudinary secure URLs to request body
    req.body.images = req.files.map(file => file.path);
    
    next();
  });
};
