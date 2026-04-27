export const isEmail = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isPhone = (value = "") => /^[6-9]\d{9}$/.test(value.replace(/\D/g, ""));

export const minLength = (value = "", length = 8) => value.length >= length;

export const hasUppercase = (value = "") => /[A-Z]/.test(value);

export const hasNumber = (value = "") => /[0-9]/.test(value);

export const required = (value) => value !== undefined && value !== null && value.toString().trim() !== "";

export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (!isEmail(email)) errors.email = "Enter a valid email address.";
  if (!required(password)) errors.password = "Password is required.";
  return errors;
};

export const validateRegister = ({ name, email, password, role }) => {
  const errors = {};
  if (!required(name)) errors.name = "Name is required.";
  if (!isEmail(email)) errors.email = "Enter a valid email address.";
  if (!minLength(password, 8)) {
    errors.password = "Use at least 8 characters.";
  } else if (!hasUppercase(password)) {
    errors.password = "Must contain at least one uppercase letter.";
  } else if (!hasNumber(password)) {
    errors.password = "Must contain at least one number.";
  }
  if (!required(role)) errors.role = "Select an account type.";
  return errors;
};
