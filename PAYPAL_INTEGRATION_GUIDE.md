# PayPal Payment Integration Guide

This guide covers the complete PayPal payment integration for the Zignal platform, including payment link generation, invoice creation, and admin management.

## 🚀 Features

- **Payment Link Generation**: Create secure PayPal payment links for customers
- **Invoice Management**: Generate and track payment invoices
- **Admin Dashboard**: Comprehensive payment management interface
- **Real-time Status Updates**: Track payment status in real-time
- **Multi-currency Support**: Support for USD, EUR, GBP, CAD, AUD
- **Secure Processing**: PayPal's secure payment processing
- **Customer Portal**: Dedicated payment pages for customers

## 📋 Prerequisites

1. **PayPal Developer Account**: Sign up at [PayPal Developer](https://developer.paypal.com/)
2. **PayPal App**: Create a PayPal app to get API credentials
3. **Supabase Database**: Ensure Supabase is set up and running
4. **Environment Variables**: Configure PayPal API credentials

## 🛠️ Installation & Setup

### 1. Apply Database Migration

```bash
# Run the PayPal migration script
node apply-paypal-migration.js
```

This creates the `paypal_payments` table with the following structure:
- `id`: Unique payment identifier
- `amount`: Payment amount
- `currency`: Payment currency
- `description`: Payment description
- `customer_name`: Customer name
- `customer_email`: Customer email
- `status`: Payment status (pending, completed, failed)
- `payment_link`: Generated payment link
- `paypal_order_id`: PayPal order ID
- `transaction_details`: Full transaction details
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### 2. Environment Variables

Add the following to your `.env.local` file:

```env
# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. PayPal App Setup

1. Go to [PayPal Developer Console](https://developer.paypal.com/developer/applications/)
2. Create a new app
3. Select "Default Application" or create a custom app
4. Choose "Sandbox" for testing or "Live" for production
5. Copy the Client ID and Client Secret

## 🎯 Usage

### Admin Panel Access

Navigate to `/admin/dashboard/payments` to access the PayPal payment management interface.

### Creating Payment Links

1. **Access Admin Panel**: Go to Admin Dashboard → PayPal Payments
2. **Create Payment Link**: Click "Create Payment Link" tab
3. **Fill Details**:
   - Amount (required)
   - Currency (USD, EUR, GBP, CAD, AUD)
   - Description (required)
   - Customer Name (required)
   - Customer Email (required)
4. **Generate Link**: Click "Generate Payment Link"
5. **Share Link**: Copy and share the generated payment link

### Managing Payments

1. **View All Payments**: Go to "Manage Payments" tab
2. **Filter Options**:
   - Search by customer name, email, or payment ID
   - Filter by status (pending, completed, failed)
   - Filter by date (today, week, month)
3. **Payment Actions**:
   - Copy payment link
   - Open payment link
   - View payment details

## 🔧 API Endpoints

### Create Payment Link
```http
POST /api/payments/paypal/create-link
Content-Type: application/json

{
  "amount": 100.00,
  "currency": "USD",
  "description": "Trading package subscription",
  "customerName": "John Doe",
  "customerEmail": "john@example.com"
}
```

### Get Payment Details
```http
GET /api/payments/paypal/get-payment?paymentId=payment-id
```

### Update Payment Status
```http
POST /api/payments/paypal/update-status
Content-Type: application/json

{
  "paymentId": "payment-id",
  "status": "completed",
  "paypalOrderId": "paypal-order-id",
  "transactionDetails": { ... }
}
```

### List Payments (Admin)
```http
GET /api/payments/paypal/list?limit=50&offset=0&status=all
```

## 🎨 Components

### PayPalPaymentLink
Main component for creating payment links with PayPal integration.

**Props:**
- `onPaymentSuccess`: Callback for successful payments
- `onPaymentError`: Callback for payment errors

### PayPalPaymentsManager
Admin component for managing all PayPal payments.

**Features:**
- Payment listing with filters
- Search functionality
- Status management
- Payment statistics

## 🔒 Security Features

### Row Level Security (RLS)
- Admin-only access to payment management
- Public access to payment pages (by ID)
- Secure payment status updates

### Data Protection
- Encrypted payment details
- Secure API endpoints
- Input validation and sanitization

## 🧪 Testing

### Test Payment Flow
1. Create a test payment link
2. Use PayPal sandbox credentials
3. Complete test payment
4. Verify status updates

### Test Environment
```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=sb_... # Sandbox client ID
PAYPAL_CLIENT_SECRET=sb_... # Sandbox client secret
```

## 📊 Monitoring & Analytics

### Payment Statistics
- Total payments count
- Total amount processed
- Completed payments amount
- Payment status distribution

### Real-time Updates
- Payment status changes
- Transaction notifications
- Error logging

## 🚨 Troubleshooting

### Common Issues

**1. "PayPal client not found"**
- Check `NEXT_PUBLIC_PAYPAL_CLIENT_ID` environment variable
- Verify PayPal app is active

**2. "Payment link generation failed"**
- Check database connection
- Verify RLS policies
- Check admin permissions

**3. "Payment not processing"**
- Verify PayPal credentials
- Check webhook configuration
- Review transaction logs

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## 🔄 Webhook Integration

### PayPal Webhooks
Configure PayPal webhooks to receive real-time payment notifications:

1. **Webhook URL**: `https://yourdomain.com/api/payments/paypal/webhook`
2. **Events**: Payment completed, Payment failed
3. **Verification**: PayPal signature verification

### Webhook Handler
```typescript
// app/api/payments/paypal/webhook/route.ts
export async function POST(request: NextRequest) {
  // Verify PayPal signature
  // Update payment status
  // Send notifications
}
```

## 📈 Production Deployment

### Environment Setup
1. **PayPal Live Credentials**: Switch to production PayPal app
2. **SSL Certificate**: Ensure HTTPS for webhook endpoints
3. **Database**: Use production Supabase instance
4. **Monitoring**: Set up payment monitoring

### Security Checklist
- [ ] PayPal production credentials configured
- [ ] HTTPS enabled for all endpoints
- [ ] RLS policies properly configured
- [ ] Webhook signature verification enabled
- [ ] Error logging configured
- [ ] Payment monitoring set up

## 🆘 Support

### Documentation
- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [PayPal REST API](https://developer.paypal.com/docs/api/overview/)
- [PayPal Webhooks](https://developer.paypal.com/docs/api/webhooks/)

### Contact
For technical support or questions about the PayPal integration, please refer to the main project documentation or contact the development team.

---

**🎉 Your PayPal payment integration is now ready to use!**

The system provides a complete payment solution with secure link generation, real-time status tracking, and comprehensive admin management tools.
