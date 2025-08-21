const rules = {
  firstName: {
    required: true,
    type: "string",
    errorMessage: "First name is required.",
  },
  lastName: {
    required: true,
    type: "string",
    errorMessage: "Last name is required.",
  },
  email: {
    required: true,
    type: "string",
    pattern: /^\S+@\S+\.\S+$/,
    errorMessage: "A valid email is required.",
  },
  password: {
    required: true,
    type: "string",
    minLength: 6,
    errorMessage: "Password is required and must be at least 6 characters.",
  },
  phone: {
    required: true,
    type: "string",
    pattern: /^[0-9]{10}$/,
    errorMessage: "A valid 10-digit phone number is required.",
  },
  gender: {
    required: true,
    type: "string",
    allowedValues: ["male", "female", "other"],
    errorMessage: "Gender must be male, female, or other.",
  },
  address: {
    required: true,
    type: "string",
    errorMessage: "Address is required.",
  },
  dob: {
    required: true,
    type: "string", // or "date" if you validate it later
    errorMessage: "Date of birth is required.",
  },
  joiningDate: {
    required: true,
    type: "string", // or "date"
    errorMessage: "Joining date is required.",
  },
  designation: {
    required: true,
    type: "string",
    errorMessage: "Designation is required.",
  },
  section: {
    required: true,
    type: "string",
    errorMessage: "Section is required.",
  },
  shift: {
    required: true,
    type: "string",
    allowedValues: ["morning", "evening", "night"], // adjust if needed
    errorMessage: "Shift must be morning, evening, or night.",
  },
};
