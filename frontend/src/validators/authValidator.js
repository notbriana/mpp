function validateEmail(form, errors) {
  const email = (form.email || '').trim();
  if (!email) {
    errors.email = 'Email is required.';
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }
}

function validateName(form, errors) {
  const name = (form.name || '').trim();
  if (!name) {
    errors.name = 'Full name is required.';
  }
}

function validatePassword(form, errors) {
  if (!form.password) {
    errors.password = 'Password is required.';
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
}

function validateConfirmPassword(form, errors) {
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }
}

function validateNewPassword(form, errors) {
  if (!form.newPassword) {
    errors.newPassword = 'New password is required.';
  } else if (form.newPassword.length < 6) {
    errors.newPassword = 'Password must be at least 6 characters.';
  }
}

function validateConfirmNewPassword(form, errors) {
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }
}

export function validateLogin(form) {
  const errors = {};
  validateEmail(form, errors);
  validatePassword(form, errors);
  return errors;
}

export function validateRegister(form) {
  const errors = {};
  validateName(form, errors);
  validateEmail(form, errors);
  validatePassword(form, errors);
  validateConfirmPassword(form, errors);
  return errors;
}

export function validatePasswordChange(form) {
  const errors = {};
  validateEmail(form, errors);
  if (!form.currentPassword) {
    errors.currentPassword = 'Current password is required.';
  }
  validateNewPassword(form, errors);
  validateConfirmNewPassword(form, errors);
  return errors;
}
