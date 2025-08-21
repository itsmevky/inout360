const rules = {
  first_name: {
    required: true,
    type: "string",
    errorMessage: "First name is required.",
  },
  last_name: {
    required: true,
    type: "string",
    errorMessage: "Last name is required.",
  },
  dateOfBirth: {
    required: true,
    type: "string", // or "date" depending on your validator handling
    errorMessage: "Date of birth is required.",
  },
  gender: {
    required: true,
    type: "string",
    allowedValues: ["male", "female", "other"],
    errorMessage: "Gender is required.",
  },
  middleName: {
    required: true,
    type: "string",
    errorMessage: "Middle name is required.",
  },
  bg: {
    required: true,
    type: "string",
    allowedValues: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    errorMessage: "A valid blood group is required.",
  },
  nationality: {
    required: true,
    type: "string",

    errorMessage: "Select Nationality .",
  },
  religion: {
    required: true,
    type: "string",

    errorMessage: "Select Religion",
  },
  address: {
    required: true,
    type: "string",
    errorMessage: "Address is required.",
  },
};

export default rules;
