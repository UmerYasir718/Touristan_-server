const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const ErrorResponse = require('../utils/errorResponse');

// Configure Cloudinary (using existing configuration from environment)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Cloudinary storage for post images
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, crop: 'limit' }],
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
    fieldSize: 5 * 1024 * 1024, // 5MB field size limit
    fields: 20 // Allow up to 20 non-file fields
  },
  fileFilter: fileFilter,
  preservePath: true // Preserve full path of files
});

// Middleware for handling post image uploads
exports.uploadPostImage = (req, res, next) => {
  console.log('Starting image upload middleware');
  console.log('Request body before upload:', req.body);
  
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
      console.error('Multer error during upload:', err);
      return next(new ErrorResponse(`Upload error: ${err.message}`, 400));
    } else if (err) {
      // An unknown error occurred
      console.error('Unknown error during upload:', err);
      return next(new ErrorResponse(`Error: ${err.message}`, 400));
    }
    
    console.log('Request body after upload:', req.body);
    
    // If no file was uploaded, continue without error (post without image)
    if (!req.file) {
      console.log('No file in req.file after upload process');
      return next();
    }
    
    // Add Cloudinary secure URL to request body
    req.body.image = req.file.path;
    console.log('Image uploaded successfully to Cloudinary:', req.file.path);
    
    // Make sure content field is preserved
    console.log('Content field after upload:', req.body.content);
    
    next();
  });
};
