# Authentication & Subscription System

This document describes the authentication and subscription system implemented for Intel AI RAG application.

## Features Implemented

### 1. **User Authentication**
- User registration (signup)
- User login with JWT tokens
- Secure password hashing using bcryptjs
- Token-based authentication for API requests

### 2. **Subscription Management**
- Multiple subscription packages:
  - **Free**: Limited access (2 documents, 10 chats/day)
  - **Basic**: $9.99/month - 10 documents, 100 chats/day, full AI/Doc chat access
  - **Pro**: $29.99/month - 50 documents, unlimited chats, full access
  - **Enterprise**: $99.99/month - Unlimited everything

### 3. **Access Control**
- **Guest Users** (not logged in):
  - Cannot upload documents
  - Cannot use AI Chat or Doc Chat
  - Must sign up/login to access features

- **Logged-in Users without Subscription**:
  - Limited to 2 document uploads
  - Limited to 10 chats per day
  - Must subscribe for full access

- **Subscribed Users**:
  - Full access based on their package tier
  - Document upload limits enforced
  - Chat limits enforced (or unlimited)

### 4. **Dummy Payment System**
- Simple card payment interface
- Test payment processing
- Any 16-digit card number works (except those starting with '0000')
- Automatically activates subscription after payment

## Backend Components

### Models
1. **User Model** (`backend/models/User.js`):
   - Name, email, password (hashed)
   - Role (guest/user/admin)
   - Subscription reference
   - Document count tracking
   - Daily chat count tracking

2. **Subscription Model** (`backend/models/Subscription.js`):
   - Package type
   - Features (chat limits, document limits)
   - Status (active/expired/cancelled)
   - Start and end dates
   - Payment ID

### Controllers
1. **Auth Controller** (`backend/controllers/auth.js`):
   - `/api/auth/register` - User registration
   - `/api/auth/login` - User login
   - `/api/auth/profile` - Get user profile
   - `/api/auth/logout` - Logout

2. **Payment Controller** (`backend/controllers/payment.js`):
   - `/api/packages` - Get available packages
   - `/api/payment/process` - Process payment
   - `/api/subscription` - Get user subscription
   - `/api/subscription/cancel` - Cancel subscription

3. **Updated Chat Controller** (`backend/controllers/chat.js`):
   - Checks user authentication
   - Enforces chat limits
   - Tracks daily usage

4. **Updated Doc Controller** (`backend/controllers/index.js`):
   - Checks user authentication
   - Enforces document upload limits
   - Requires active subscription for Doc Chat

### Middleware
- **authenticate**: Requires valid JWT token
- **optionalAuth**: Allows both authenticated and guest users
- **requireSubscription**: Requires active subscription
- **checkFeatureAccess**: Checks specific feature access

## Frontend Components

### Pages
1. **Login** (`frontend/src/pages/Login.jsx`):
   - Email and password login
   - Redirects to AI Chat on success

2. **Signup** (`frontend/src/pages/Signup.jsx`):
   - User registration form
   - Redirects to pricing page after signup

3. **Payment** (`frontend/src/pages/Payment.jsx`):
   - Package selection
   - Dummy payment form
   - Activates subscription on success

### Updated Components
1. **Navbar** (`frontend/src/components/Navbar.jsx`):
   - Shows Login/Signup for guests
   - Shows user name and logout for logged-in users
   - Shows PRO badge for subscribed users

2. **AI Chat** (`frontend/src/pages/AiChat.jsx`):
   - Checks authentication before sending messages
   - Shows auth prompt for guests
   - Handles subscription errors

3. **Doc Chat** (`frontend/src/components/Chat.jsx`):
   - Checks authentication for uploads and queries
   - Shows document limits
   - Redirects to pricing when limits exceeded

4. **Pricing Page** (`frontend/src/pages/Pricing.jsx`):
   - Updated to redirect to signup if not logged in
   - Redirects to payment page for paid plans

## Environment Variables

Add to `backend/.env`:
```
JWT_SECRET=your-secret-key-here
MONGODB_URI=your-mongodb-connection-string
```

## Testing the System

### Test Flow:
1. **Signup**: Go to `/signup` and create an account
2. **Try Free Access**: You'll have limited access (2 documents, 10 chats)
3. **Upgrade**: Go to `/pricing` and select a plan
4. **Payment**: Use dummy card (e.g., `1234 5678 9012 3456`)
5. **Access**: You now have full access based on your plan!

### Dummy Card Details (All work):
- Card Number: Any 16 digits (except starting with 0000)
- CVV: Any 3-4 digits
- Expiry: Any future date
- Name: Any name

### Example Test Cards:
- `1234 5678 9012 3456` ✅ Success
- `4111 1111 1111 1111` ✅ Success  
- `0000 0000 0000 0000` ❌ Declined

## API Authentication

To make authenticated requests, include the JWT token in the Authorization header:

```javascript
const token = localStorage.getItem('token');

fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ message: 'Hello' })
});
```

## Security Notes

⚠️ **Important**: This is a DUMMY payment system for testing purposes only!

For production:
1. Replace dummy payment with real payment gateway (Stripe, PayPal, etc.)
2. Use strong JWT_SECRET in environment variables
3. Implement HTTPS
4. Add rate limiting
5. Add email verification
6. Implement password reset functionality
7. Add more robust error handling

## Database Collections

### users
- Stores user accounts
- Tracks document uploads and daily chat counts

### subscriptions
- Stores subscription details
- Links to users
- Tracks payment information

### contacts
- Stores contact form submissions (existing)

## Default Package Limits

| Package | Price | Documents | Daily Chats | AI Chat Access | Doc Chat Access |
|---------|-------|-----------|-------------|----------------|-----------------|
| Free (Starter) | $0 | 2 | 10 | ⚠️ Knowledge Base Only | ✅ Yes |
| Basic | $9.99 | 10 | 100 | ✅ Full Access | ✅ Yes |
| Pro | $29.99 | Unlimited | Unlimited | ✅ Full Access | ✅ Yes |
| Enterprise | $99.99 | Unlimited | Unlimited | ✅ Full Access | ✅ Yes |

### Free Tier Restrictions:
- **AI Chat**: Can ONLY ask questions about:
  - IntelAI company information
  - Uploaded documents
  - Site services and features
- **Doc Chat**: Full access to uploaded documents (up to 2)
- **Limit**: If users ask unrelated questions (e.g., "What is Python?"), they receive:
  > "⚠️ This query is outside your knowledge base. Please upgrade your subscription to access broader AI responses."

### Pro/Paid Tier Benefits:
- **AI Chat**: Can ask ANY question (general knowledge, programming, etc.)
- **Doc Chat**: Unlimited document uploads and queries
- **No restrictions** on conversation topics

## Support

For issues or questions:
- Email: support@ragqa.io
- Phone: +91 98765 43210

