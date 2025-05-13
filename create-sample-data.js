// Script to create sample reviews and contact messages
require("dotenv").config();
const mongoose = require("mongoose");
const Review = require("./models/Review");
const Contact = require("./models/Contact");
const User = require("./models/User");
const Package = require("./models/Package");

// Connect to database
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

const createSampleData = async () => {
  try {
    console.log("Creating sample reviews and contact messages...");

    // Get users and packages
    const users = await User.find().limit(3);
    const packages = await Package.find().limit(3);

    if (users.length === 0 || packages.length === 0) {
      console.error(
        "No users or packages found. Please run create-test-user.js first."
      );
      process.exit(1);
    }

    // Sample reviews data
    const reviewsData = [
      {
        title: "Amazing Experience",
        text: "This was the best trip I've ever had. The views were breathtaking and the guide was very knowledgeable.",
        rating: 5,
        packageId: packages[0]._id,
        userId: users[0]._id,
        approved: true,
        createdAt: new Date("2025-03-15"),
      },
      {
        title: "Good but could be better",
        text: "The trip was good overall, but the accommodation could have been better. The scenery was beautiful though.",
        rating: 4,
        packageId: packages[1]._id,
        userId: users[0]._id,
        approved: true,
        createdAt: new Date("2025-03-20"),
      },
      {
        title: "Disappointing Service",
        text: "The tour guide was late and seemed unprepared. The locations were nice but the service was lacking.",
        rating: 2,
        packageId: packages[2]._id,
        userId: users[0]._id,
        approved: false,
        createdAt: new Date("2025-04-01"),
      },
      {
        title: "Wonderful Trip",
        text: "Everything was well organized. The food was delicious and the activities were fun for the whole family.",
        rating: 5,
        packageId: packages[0]._id,
        userId: users[0]._id,
        approved: false,
        createdAt: new Date("2025-04-10"),
      },
      {
        title: "Average Experience",
        text: "The trip was okay, nothing special. The price was a bit high for what was offered.",
        rating: 3,
        packageId: packages[1]._id,
        userId: users[0]._id,
        approved: true,
        createdAt: new Date("2025-04-15"),
      },
    ];

    // Sample contact messages data
    const contactsData = [
      {
        name: "Ali Ahmed",
        email: "ali@example.com",
        phone: "+92 300 1234567",
        subject: "Booking Inquiry",
        message:
          "I would like to know if there are any discounts for group bookings of more than 10 people.",
        status: "unread",
        userId: users[0]._id,
        createdAt: new Date("2025-03-10"),
      },
      {
        name: "Sara Khan",
        email: "sara@example.com",
        phone: "+92 301 9876543",
        subject: "Special Requirements",
        message:
          "I have some dietary restrictions. Can you accommodate vegetarian meals during the trip?",
        status: "read",
        userId: users[0]._id,
        createdAt: new Date("2025-03-15"),
      },
      {
        name: "Usman Ali",
        email: "usman@example.com",
        phone: "+92 302 4567890",
        subject: "Cancellation Policy",
        message:
          "What is your cancellation policy? I might need to reschedule my trip due to work commitments.",
        status: "replied",
        reply: {
          text: "Thank you for your inquiry. Our cancellation policy allows full refunds if cancelled 7 days before the trip. For cancellations within 7 days, a 50% fee applies.",
          date: new Date("2025-03-18"),
          adminId:
            users.find((user) => user.role === "admin")?._id || users[0]._id,
        },
        userId: users[0]._id,
        createdAt: new Date("2025-03-17"),
      },
      {
        name: "Fatima Zahra",
        email: "fatima@example.com",
        phone: "+92 303 1122334",
        subject: "Payment Issue",
        message:
          "I tried to make a payment for my booking but the transaction failed. Can you help me resolve this issue?",
        status: "replied",
        reply: {
          text: "I apologize for the inconvenience. We've checked our payment system and there seems to be a temporary issue. Please try again in a few hours or use an alternative payment method.",
          date: new Date("2025-04-02"),
          adminId:
            users.find((user) => user.role === "admin")?._id || users[0]._id,
        },
        userId: users[0]._id,
        createdAt: new Date("2025-04-01"),
      },
    ];

    // Clear existing data
    await Review.deleteMany({});
    await Contact.deleteMany({});

    // Insert sample data
    await Review.insertMany(reviewsData);
    await Contact.insertMany(contactsData);

    console.log("Sample data created successfully!");
    console.log(
      `Created ${reviewsData.length} reviews and ${contactsData.length} contact messages.`
    );

    process.exit(0);
  } catch (error) {
    console.error("Error creating sample data:", error);
    process.exit(1);
  }
};

// Run the script
createSampleData();
