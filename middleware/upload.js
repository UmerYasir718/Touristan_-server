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

// Set up Cloudinary storage with timeout
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'packages',
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

// Middleware for handling package image uploads
exports.uploadPackageImage = (req, res, next) => {
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
    // Cloudinary returns the URL in req.file.path
    req.body.img = req.file.path;
    
    // You can also access additional Cloudinary data if needed
    console.log('Cloudinary upload response:', req.file);
    
    next();
  });
};

// Middleware for handling multiple package images upload
exports.uploadPackageImages = (req, res, next) => {
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
    // Each file in req.files contains the Cloudinary URL in the path property
    req.body.images = req.files.map(file => file.path);
    
    // You can also access additional Cloudinary data if needed
    console.log('Cloudinary upload responses:', req.files);
    
    next();
  });
};

// Middleware for handling profile image uploads
exports.uploadProfileImage = (req, res, next) => {
  // Create a custom storage for profile images
  const profileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'profiles',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }],
      timeout: 15000 // 15 seconds timeout for Cloudinary upload
    }
  });

  // Create a custom upload instance for profile images
  const profileUpload = multer({
    storage: profileStorage,
    limits: { 
      fileSize: 2000000, // 2MB max file size for profile images
      fieldSize: 2 * 1024 * 1024 // 2MB field size limit
    },
    fileFilter: fileFilter
  });

  const uploadSingle = profileUpload.single('profileImage');

  // Set a timeout for the multer upload
  const uploadTimeout = setTimeout(() => {
    return next(new ErrorResponse('Profile image upload timed out. Please try again with a smaller image or check your connection.', 408));
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
    
    // If no file was uploaded, return an error
    if (!req.file) {
      return next(new ErrorResponse('Please upload a profile image', 400));
    }
    
    // Add Cloudinary secure URL to request body
    req.body.profileImage = req.file.path;
    
    // You can also access additional Cloudinary data if needed
    console.log('Cloudinary profile upload response:', req.file);
    
    next();
  });
};
