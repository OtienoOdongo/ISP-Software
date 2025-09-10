

export const initialConfig = {
  paymentMethods: [
    {
      type: 'mpesa_paybill',
      apiKey: '',
      secretKey: '',
      shortCode: '',
      passKey: '',
      callbackURL: '',
      isActive: true,
      sandboxMode: false,
      webhookSecret: '',
      transactionLimit: '',
      autoSettle: true
    },
    {
      type: 'mpesa_till',
      tillNumber: '',
      storeNumber: '',
      passKey: '',
      callbackURL: '',
      isActive: false,
      sandboxMode: false,
      webhookSecret: '',
      transactionLimit: '',
      autoSettle: true
    },
    {
      type: 'bank',
      bankName: '',
      accountNumber: '',
      accountName: '',
      branchCode: '',
      swiftCode: '',
      callbackURL: '',
      isActive: false,
      transactionLimit: '',
      autoSettle: true
    }
  ],
  configurationVersion: '1.0.0',
  lastUpdated: new Date().toISOString()
};

export const mockSavedConfig = {
  paymentMethods: [
    {
      type: 'mpesa_paybill',
      apiKey: 'sk_live_1234567890abcdef',
      secretKey: 'sec_9876543210fedcba',
      shortCode: '123456',
      passKey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
      callbackURL: 'https://api.example.com/mpesa/callback',
      isActive: true,
      sandboxMode: false,
      webhookSecret: 'whsec_1234567890abcdef',
      transactionLimit: '500000',
      autoSettle: true
    },
    {
      type: 'mpesa_till',
      tillNumber: '1234567',
      storeNumber: 'Nairobi001',
      passKey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
      callbackURL: 'https://api.example.com/mpesa/till/callback',
      isActive: true,
      sandboxMode: false,
      webhookSecret: 'whsec_till_1234567890',
      transactionLimit: '200000',
      autoSettle: true
    },
    {
      type: 'bank',
      bankName: 'Equity Bank',
      accountNumber: '1234567890',
      accountName: 'Example Business Ltd',
      branchCode: '068',
      swiftCode: 'EQBLKENA',
      callbackURL: 'https://api.example.com/bank/callback',
      isActive: true,
      transactionLimit: '1000000',
      autoSettle: false
    },
    {
      type: 'paypal',
      clientId: 'AeA9Q3hL9L1dL8QJ6QJ5QJ4QJ3QJ2QJ1QJ0QJ9QJ8QJ7QJ6QJ5QJ4QJ3QJ2QJ1QJ0',
      secret: 'EC-9QJ8QJ7QJ6QJ5QJ4QJ3QJ2QJ1QJ0QJ9QJ8QJ7QJ6QJ5QJ4QJ3QJ2QJ1QJ0',
      merchantId: 'XYZ1234567890',
      callbackURL: 'https://api.example.com/paypal/callback',
      isActive: true,
      sandboxMode: true,
      webhookSecret: 'whsec_paypal_1234567890abcdef',
      transactionLimit: '10000',
      autoSettle: false
    }
  ],
  configurationVersion: '1.2.0',
  lastUpdated: new Date().toISOString()
};

export const mockHistory = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    user: 'admin@example.com',
    action: 'Updated M-Pesa credentials',
    changes: ['apiKey', 'secretKey']
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    user: 'dev@example.com',
    action: 'Added Bank Transfer method',
    changes: ['Added new payment method: Bank Transfer']
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    user: 'finance@example.com',
    action: 'Added M-Pesa Till',
    changes: ['Added new payment method: M-Pesa Till']
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 345600000).toISOString(),
    user: 'dev@example.com',
    action: 'Added PayPal integration',
    changes: ['Added new payment method: PayPal']
  }
];