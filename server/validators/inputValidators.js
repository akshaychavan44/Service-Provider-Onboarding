const isValidEmail = (email) => {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

const validateRegisterInput = (data) => {
  const errors = {};
  const { name, email, phone, password, confirmPassword } = data;

  if (!name || name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters long';
  }

  if (!email || !isValidEmail(email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!phone || phone.trim().length < 7) {
    errors.phone = 'Please provide a valid phone number (at least 7 digits)';
  }

  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

const validateLoginInput = (data) => {
  const errors = {};
  const { email, password } = data;

  if (!email || !isValidEmail(email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

const validateProfileSubmission = (profile, documents = []) => {
  const missingFields = [];

  // Check personal
  if (!profile.dateOfBirth) missingFields.push('Date of Birth');
  if (!profile.gender) missingFields.push('Gender');

  // Check professional
  if (!profile.skills || profile.skills.length === 0) {
    missingFields.push('At least one skill');
  }
  if (profile.experience === undefined || profile.experience === null) {
    missingFields.push('Years of Experience');
  }
  if (!profile.bio || profile.bio.trim().length < 10) {
    missingFields.push('Professional Bio (at least 10 characters)');
  }

  // Check services
  if (!profile.serviceCategories || profile.serviceCategories.length === 0) {
    missingFields.push('At least one Service Category');
  }

  // Check location
  if (!profile.address || !profile.address.trim()) missingFields.push('Street Address');
  if (!profile.city || !profile.city.trim()) missingFields.push('City');
  if (!profile.state || !profile.state.trim()) missingFields.push('State');
  if (!profile.pincode || !profile.pincode.trim()) missingFields.push('Pincode');

  // Check photo & documents
  if (!profile.profilePhoto) {
    missingFields.push('Profile Photo');
  }
  if (!documents || documents.length === 0) {
    missingFields.push('At least one Verification Document (e.g. ID Proof)');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

module.exports = {
  isValidEmail,
  validateRegisterInput,
  validateLoginInput,
  validateProfileSubmission,
};
