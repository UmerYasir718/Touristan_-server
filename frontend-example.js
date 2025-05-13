// Frontend Stripe Integration Example

// 1. First, include Stripe.js in your HTML
// <script src="https://js.stripe.com/v3/"></script>

// 2. Initialize Stripe with your publishable key
const stripe = Stripe('pk_test_51NnIorCqPnESIcUCUezx9Ae1Tfcxrnhqaxi0KYluXByG3dEuMUMlLY8FcJG3eUzajEWLL8oyS7OJuzUgMKcOpGlH00QwR1IcOn');

// 3. Create a payment form in your HTML
// <form id="payment-form">
//   <div id="card-element"><!-- Stripe Card Element will be inserted here --></div>
//   <button id="submit">Pay Now</button>
// </form>

// 4. Create a card element
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

// 5. Handle form submission
document.getElementById('payment-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  
  // Disable the submit button to prevent repeated clicks
  document.getElementById('submit').disabled = true;
  
  try {
    // Step 1: Create a booking and get a payment intent
    const bookingResponse = await fetch('/api/payments/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN'
      },
      body: JSON.stringify({
        packageId: 'your_package_id',
        travelDate: '2025-06-15',
        travelers: 2,
        customerName: 'Umer Yasir',
        customerEmail: 'umerc5531@gmail.com',
        customerPhone: '03314911420'
      })
    });
    
    const bookingData = await bookingResponse.json();
    
    if (!bookingData.success) {
      throw new Error(bookingData.message || 'Failed to create booking');
    }
    
    const { clientSecret, bookingId } = bookingData;
    
    // Step 2: Confirm the payment with Stripe
    const paymentResult = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: 'Umer Yasir',
          email: 'umerc5531@gmail.com',
          phone: '03314911420',
          address: {
            postal_code: '333333'
          }
        }
      }
    });
    
    if (paymentResult.error) {
      // Show error to your customer
      throw new Error(paymentResult.error.message);
    } else if (paymentResult.paymentIntent.status === 'succeeded') {
      // Step 3: Confirm the payment on your backend
      const confirmResponse = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_JWT_TOKEN'
        },
        body: JSON.stringify({
          paymentIntentId: paymentResult.paymentIntent.id,
          bookingId: bookingId
        })
      });
      
      const confirmData = await confirmResponse.json();
      
      if (!confirmData.success) {
        throw new Error(confirmData.message || 'Failed to confirm payment');
      }
      
      // Payment successful - show confirmation to customer
      alert('Payment successful! Your booking is confirmed.');
      // Redirect to booking confirmation page
      window.location.href = `/booking-confirmation/${bookingId}`;
    }
  } catch (error) {
    // Display error message to user
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = error.message || 'An unexpected error occurred.';
    errorElement.style.display = 'block';
    
    // Re-enable the submit button
    document.getElementById('submit').disabled = false;
  }
});
