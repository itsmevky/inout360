const rules = {
  className: {
    required: true,
    type: "string",
    errorMessage: "Class name is required.",
  },
  description: {
    required: true,
    type: "string",
    errorMessage: "Description is required.",
  },
  capacity: {
    required: true,
    type: "number",
    errorMessage: "Capacity is required and must be a number.",
  },
  rooms:{
    required: true,
    type: "number",
    errorMessage: "Roo, is required and must be a number.",
  },

  teacherId: {
    required: true,
    type: "string",
    errorMessage: "Teacher ID is required.",
  },
  feeIds: {
    required: true,
    type: "array",
    errorMessage: "At least one fee ID is required.",
  },
  utilities: {
    required: true,
    type: "array",
    errorMessage: "Utilities are required.",
  },
};


export default rules;
