
export const validatePaymentMethod = (method) => {
  const errors = {};

  if (!method.type) {
    errors.type = 'Payment method type is required';
  }

  if (method.type.includes('mpesa')) {
    if (!method.passKey) errors.passKey = 'Pass key is required';
    if (method.type === 'mpesa_paybill' && !method.shortCode) {
      errors.shortCode = 'Paybill number is required';
    }
    if (method.type === 'mpesa_till' && !method.tillNumber) {
      errors.tillNumber = 'Till number is required';
    }
  }

  if (method.type === 'paypal') {
    if (!method.clientId) errors.clientId = 'Client ID is required';
    if (!method.secret) errors.secret = 'Secret is required';
  }

  if (method.type === 'bank_transfer') {
    if (!method.bankName) errors.bankName = 'Bank name is required';
    if (!method.accountNumber) errors.accountNumber = 'Account number is required';
    if (!method.accountName) errors.accountName = 'Account name is required';
  }

  return errors;
};