const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const Package = require("../models/Package");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const stripe = require("../config/stripe");

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Get counts
    const userCount = await User.countDocuments();
    const packageCount = await Package.countDocuments();
    const bookingCount = await Booking.countDocuments();

    // Get booking status counts
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const confirmedBookings = await Booking.countDocuments({
      status: "confirmed",
    });
    const cancelledBookings = await Booking.countDocuments({
      status: "cancelled",
    });

    // Get total revenue
    const payments = await Payment.find({ status: "succeeded" });
    const totalRevenue = payments.reduce(
      (total, payment) => total + payment.amount,
      0
    );

    // Get Stripe balance
    let stripeBalance = { available: 0, pending: 0 };
    try {
      const balance = await stripe.balance.retrieve();
      console.log(
        "Stripe balance currencies:",
        balance.available.map((b) => b.currency)
      );

      // Sum up available amounts (support both USD and PKR)
      stripeBalance.available =
        balance.available.reduce((sum, balance) => {
          // Accept any currency since we're just showing the balance
          return sum + balance.amount;
        }, 0) / 100; // Convert from cents to standard currency unit

      // Sum up pending amounts (support both USD and PKR)
      stripeBalance.pending =
        balance.pending.reduce((sum, balance) => {
          // Accept any currency since we're just showing the balance
          return sum + balance.amount;
        }, 0) / 100; // Convert from cents to standard currency unit
    } catch (error) {
      console.error("Error retrieving Stripe balance:", error);
    }

    res.json({
      success: true,
      data: {
        userCount,
        packageCount,
        bookingCount,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
        stripeBalance,
      },
    });
  } catch (error) {
    console.error("Error retrieving dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get booking chart data
// @route   GET /api/dashboard/booking-chart
// @access  Private/Admin
exports.getBookingChartData = asyncHandler(async (req, res) => {
  try {
    // Get booking status counts
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const confirmedBookings = await Booking.countDocuments({
      status: "confirmed",
    });
    const cancelledBookings = await Booking.countDocuments({
      status: "cancelled",
    });

    const chartData = {
      labels: ["Pending", "Confirmed", "Cancelled"],
      datasets: [
        {
          data: [pendingBookings, confirmedBookings, cancelledBookings],
          backgroundColor: ["#ffc107", "#28a745", "#dc3545"],
          borderColor: ["#fff", "#fff", "#fff"],
          borderWidth: 2,
        },
      ],
    };

    res.json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    console.error("Error retrieving booking chart data:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get revenue chart data
// @route   GET /api/dashboard/revenue-chart
// @access  Private/Admin
exports.getRevenueChartData = asyncHandler(async (req, res) => {
  try {
    // Get current date
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calculate last 6 months
    const months = [];
    const monthLabels = [];
    const monthlyRevenue = [];

    for (let i = 5; i >= 0; i--) {
      let month = currentMonth - i;
      let year = currentYear;

      if (month < 0) {
        month += 12;
        year -= 1;
      }

      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      // Get month name
      const monthName = startDate.toLocaleString("default", { month: "long" });
      monthLabels.push(monthName);
      months.push({ startDate, endDate });
    }

    // Get payments for each month
    for (const { startDate, endDate } of months) {
      const payments = await Payment.find({
        status: "succeeded",
        createdAt: { $gte: startDate, $lte: endDate },
      });

      const revenue = payments.reduce(
        (total, payment) => total + payment.amount,
        0
      );
      monthlyRevenue.push(revenue);
    }

    const chartData = {
      labels: monthLabels,
      datasets: [
        {
          label: "Revenue (PKR)",
          data: monthlyRevenue,
          borderColor: "#4299e1",
          backgroundColor: "rgba(66, 153, 225, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    };

    res.json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    console.error("Error retrieving revenue chart data:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get recent activity
// @route   GET /api/dashboard/recent-activity
// @access  Private/Admin
exports.getRecentActivity = asyncHandler(async (req, res) => {
  try {
    // Get recent bookings (last 10)
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email")
      .populate("package", "title");

    // Get recent payments (last 10)
    const recentPayments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({
        path: "booking",
        select: "packageName user",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    // Format activities
    const activities = [];

    // Add bookings to activities
    recentBookings.forEach((booking) => {
      activities.push({
        type: "booking",
        id: booking._id,
        status: booking.status,
        user: booking.user
          ? {
              id: booking.user._id,
              name: booking.user.name,
              email: booking.user.email,
            }
          : null,
        package: booking.package
          ? {
              id: booking.package._id,
              title: booking.package.title,
            }
          : { title: booking.packageName },
        amount: booking.totalAmount,
        date: booking.bookingDate,
      });
    });

    // Add payments to activities
    recentPayments.forEach((payment) => {
      activities.push({
        type: "payment",
        id: payment._id,
        status: payment.status,
        user:
          payment.booking && payment.booking.user
            ? {
                id: payment.booking.user._id,
                name: payment.booking.user.name,
                email: payment.booking.user.email,
              }
            : null,
        package: payment.booking
          ? { title: payment.booking.packageName }
          : null,
        amount: payment.amount,
        date: payment.createdAt,
      });
    });

    // Sort by date (newest first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Limit to 20 most recent activities
    const recentActivities = activities.slice(0, 20);

    res.json({
      success: true,
      data: recentActivities,
    });
  } catch (error) {
    console.error("Error retrieving recent activity:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Generate test data
// @route   POST /api/dashboard/generate-test-data
// @access  Private/Admin
exports.generateTestData = asyncHandler(async (req, res) => {
  try {
    // Sample data
    const users = [
      {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
        role: "user",
      },
      {
        name: "Bob Johnson",
        email: "bob@example.com",
        password: "password123",
        role: "user",
      },
      {
        name: "Alice Brown",
        email: "alice@example.com",
        password: "password123",
        role: "user",
      },
      {
        name: "Charlie Wilson",
        email: "charlie@example.com",
        password: "password123",
        role: "user",
      },
    ];

    const packages = [
      {
        title: "Northern Areas Tour",
        description: "Explore the beautiful northern areas of Pakistan",
        price: 25000,
        duration: 7,
        img: "https://res.cloudinary.com/dngm7icac/image/upload/v1/packages/northern_areas.jpg",
      },
      {
        title: "Swat Valley Adventure",
        description: "Experience the natural beauty of Swat Valley",
        price: 15000,
        duration: 5,
        img: "https://res.cloudinary.com/dngm7icac/image/upload/v1/packages/swat_valley.jpg",
      },
      {
        title: "Hunza Valley Expedition",
        description: "Discover the wonders of Hunza Valley",
        price: 30000,
        duration: 10,
        img: "https://res.cloudinary.com/dngm7icac/image/upload/v1/packages/hunza_valley.jpg",
      },
    ];

    // Create users if they don't exist
    let createdUsers = [];
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user);
      } else {
        createdUsers.push(existingUser);
      }
    }

    // Create packages if they don't exist
    let createdPackages = [];
    for (const packageData of packages) {
      const existingPackage = await Package.findOne({
        title: packageData.title,
      });
      if (!existingPackage) {
        const tourPackage = new Package(packageData);
        await tourPackage.save();
        createdPackages.push(tourPackage);
      } else {
        createdPackages.push(existingPackage);
      }
    }

    // Generate bookings and payments for the last 6 months
    const bookings = [];
    const payments = [];

    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 6);

    // Statuses for random selection
    const bookingStatuses = ["pending", "confirmed", "cancelled"];
    const paymentStatuses = ["pending", "succeeded", "failed"];

    // Generate 50 random bookings and payments
    for (let i = 0; i < 50; i++) {
      // Random user and package
      const user =
        createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const tourPackage =
        createdPackages[Math.floor(Math.random() * createdPackages.length)];

      // Random date between 6 months ago and now
      const bookingDate = new Date(
        sixMonthsAgo.getTime() +
          Math.random() * (currentDate.getTime() - sixMonthsAgo.getTime())
      );

      // Random travelers (1-5)
      const travelers = Math.floor(Math.random() * 5) + 1;

      // Calculate total amount
      const totalAmount = tourPackage.price * travelers;

      // Random status
      const bookingStatus =
        bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];
      const paymentStatus =
        bookingStatus === "cancelled"
          ? "failed"
          : bookingStatus === "confirmed"
          ? "succeeded"
          : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];

      // Create booking
      const booking = new Booking({
        package: tourPackage._id,
        user: user._id,
        packageName: tourPackage.title,
        packageImage: tourPackage.img,
        travelDate: new Date(bookingDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days after booking
        travelers: travelers,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: "03001234567",
        totalAmount: totalAmount,
        status: bookingStatus,
        paymentStatus: paymentStatus === "succeeded" ? "paid" : "unpaid",
        createdAt: bookingDate,
      });

      await booking.save();
      bookings.push(booking);

      // Create payment for the booking
      const payment = new Payment({
        booking: booking._id,
        amount: totalAmount,
        stripePaymentIntentId: `pi_${Math.random()
          .toString(36)
          .substring(2, 15)}`,
        stripeChargeId: `ch_${Math.random().toString(36).substring(2, 15)}`,
        transactionId: `TRX-${Date.now()}-${i}`,
        status: paymentStatus,
        createdAt: bookingDate,
      });

      await payment.save();
      payments.push(payment);
    }

    res.json({
      success: true,
      message: "Test data generated successfully",
      data: {
        users: createdUsers.length,
        packages: createdPackages.length,
        bookings: bookings.length,
        payments: payments.length,
      },
    });
  } catch (error) {
    console.error("Error generating test data:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
