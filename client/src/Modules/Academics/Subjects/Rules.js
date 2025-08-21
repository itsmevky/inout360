const rules = {
  subjectname: {
    required: true,
    type: "string",
    errorMessage: "Subject name is required.",
  },
  subjectcode: {
    required: true,
    type: "string",
    errorMessage: "Subject code is required.",
  },
  description: {
    required: true,
    type: "string",
    errorMessage: "Description is required.",
  },
  classId: {
    required: true,
    type: "string",
    errorMessage: "Class ID is required.",
  },
  teacherId: {
    required: false,
    type: "string",
    errorMessage: "Teacher ID must be a string if provided.",
  },
};
export default rules;
