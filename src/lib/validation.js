export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateEmailList = (emailString) => {
  if (!emailString || emailString.trim() === '') {
    return { valid: true, message: '' };
  }
  const emails = emailString.split(',').map(e => e.trim()).filter(e => e);
  const invalidEmails = emails.filter(email => !validateEmail(email));
  if (invalidEmails.length > 0) {
    return { valid: false, message: `Invalid email(s): ${invalidEmails.join(', ')}` };
  }
  return { valid: true, message: '' };
};

export const validateSenderEmail = (email) => {
  // Optional field - if empty, it's valid
  if (!email || email.trim() === '') {
    return { valid: true, message: '' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  return { valid: true, message: '' };
};

export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  return { valid: true, message: '' };
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true, message: '' };
};

export const getPasswordStrength = (password) => {
  let strength = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };

  if (checks.length) strength += 1;
  if (checks.lowercase) strength += 1;
  if (checks.uppercase) strength += 1;
  if (checks.number) strength += 1;
  if (checks.special) strength += 1;

  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong', 'Perfect'];
  const colors = ['red', 'orange', 'yellow', 'lime', 'green', 'green'];

  return {
    strength,
    checks,
    label: labels[Math.min(strength, 5)],
    color: colors[Math.min(strength, 5)],
  };
};

export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_ATTACHMENT_SIZE_TEXT = '5MB';

export const validateAttachmentFile = (file) => {
  if (!file) {
    return { valid: false, message: 'No file selected' };
  }
  if (file.size > MAX_ATTACHMENT_SIZE) {
    return { valid: false, message: `${file.name} exceeds ${MAX_ATTACHMENT_SIZE_TEXT} limit` };
  }
  return { valid: true, message: '' };
};
