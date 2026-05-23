# MIMBA API service layer

The frontend now talks to Laravel through `services/api`.

Data migration order:

1. Customers
2. Products
3. Sales
4. Payments
5. Notifications

Keep the existing mock providers as fallbacks while each module is connected to real API data.
