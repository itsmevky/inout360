const rules = {
  class_id: {
    required: true,
    type: "string",
    errorMessage: "Class ID is required and must be a string.",
  },
  subject: {
    required: true,
    type: "string",
    errorMessage: "Subject is required and must be a string.",
  },
  term: {
    required: true,
    type: "string",
    allowedValues: ["Term 1", "Term 2", "Term 3", "Annual"],
    errorMessage: "Term must be one of: Term 1, Term 2, Term 3, Annual.",
  },
  topics: {
    required: false,
    type: "array",
    errorMessage: "Topics must be an array.",
  },
  uploadedBy: {
    required: true,
    type: "string",
    errorMessage: "UploadedBy is required and must be a string.",
  },
  status: {
    required: true,
    type: "string",
    allowedValues: ["active", "inactive"],
    errorMessage: "Status must be either active or inactive.",
  },
};

export default rules;
