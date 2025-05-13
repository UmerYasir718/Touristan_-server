// example: seed.js or inside server.js
const User = require("../models/User");
const bcrypt = require('bcryptjs');

const createAdminUser = async () => {
  try {
    // First delete any existing admin user to start fresh
    await User.deleteOne({ email: "admin@example.com" });
    
    // Create admin user with proper password hashing
    const admin = new User({
      email: "admin@example.com",
      password: "password123", // This will be hashed by the pre-save hook
      name: "Admin User",
      role: "admin"
    });
    
    // Save the user to trigger the pre-save hook that hashes the password
    await admin.save();
    
    console.log("Admin user created successfully");
  } catch (err) {
    console.error("Error creating admin user:", err);
  }
};

createAdminUser(); // call this after DB connection
