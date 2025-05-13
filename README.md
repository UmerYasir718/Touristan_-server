# Tour Booking Backend API

A comprehensive backend system for a tour booking platform with advanced features for managing tours, bookings, payments, and user interactions.

## Core Features

### 1. Authentication & Authorization
- JWT-based authentication system
- Role-based access control (Admin, User)
- Protected and public routes with optional authentication

### 2. Tour Package Management
- Create, read, update, and delete tour packages
- Image management with Cloudinary integration
- Support for both file uploads and direct URL image setting
- Active/inactive package status

### 3. Booking System
- Complete booking lifecycle management
- User booking history
- Admin booking management with pagination

### 4. Payment Processing
- Stripe integration for secure payments
- Payment intent creation and confirmation
- Webhook handling for asynchronous payment updates
- Transaction history with pagination
- Customer information tracking

### 5. Review System
- User-submitted reviews with admin approval
- Public endpoint for approved reviews only
- Rating system for tour packages

### 6. Contact System
- User inquiry submission
- Admin reply functionality
- Email notifications for contact replies

### 7. Email Notifications
- Nodemailer integration for email delivery
- HTML email templates
- Notifications for bookings, payments, and admin replies

### 8. User Management
- User profiles with booking statistics
- Admin user management capabilities

## Technical Features

- MongoDB database with Mongoose ODM
- Express.js RESTful API architecture
- Cloudinary integration for image storage
- Stripe payment processing
- JWT authentication
- Comprehensive error handling
- Request timeout mechanisms
- Pagination for data-heavy endpoints

## Getting Started

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- MongoDB (v4.4 or higher)
- Stripe account
- Cloudinary account

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

EMAIL_SERVICE=your_email_service
EMAIL_USERNAME=your_email_username
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=your_email_address
```

### Version Requirements
This project requires specific versions of Node.js and npm as specified in the package.json file:
```json
"engines": {
  "node": ">=14.0.0",
  "npm": ">=6.0.0"
}
```

### Installation
```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## API Documentation

The API documentation is available at `/api-docs` when the server is running.

## License

[MIT](https://choosealicense.com/licenses/mit/)
