# Payment Integration & Billing

## Subscription Plans

```
Starter Plan: $29/month
├─ 10 users
├─ 5 projects
└─ Basic support

Pro Plan: $99/month
├─ 50 users
├─ 30 projects
└─ Priority support

Enterprise Plan: Custom
├─ Unlimited users
├─ Unlimited projects
└─ Dedicated support
```

## Stripe Integration

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create subscription
const subscription = await stripe.subscriptions.create({
  customer: stripeCustomerId,
  items: [{ price: pricingPlanId }],
  payment_behavior: 'default_incomplete',
  payment_settings: { save_default_payment_method: 'on_subscription' }
});
```

## Billing Cycle

- Monthly billing on subscription date
- Automatic renewal
- Upgrade/downgrade mid-cycle (prorated)
- Invoice generation and delivery
- Failed payment retry (up to 3 times)

## Usage-Based Billing

```
API Calls: $0.001 per 1000 calls
Storage: $0.50 per GB per month
Premium Support: $500/month
```

## Invoice Management

- Monthly invoice PDF generation
- Email delivery
- Downloadable from dashboard
- Tax compliance (VAT/GST)
