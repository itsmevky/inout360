const rules = {
  name: {
    required: true,
    type: "string",
    errorMessage: "Name is required.",
  },
  code: {
    required: true,
    type: "string",
    errorMessage: "Code is required.",
  },
  head: {
    required: true,
    type: "string", // consider type: "objectId" if your system supports it
    errorMessage: "Head is required.",
  },
  description: {
    required: false,
    type: "string",
  },
  departmentType: {
    required: true,
    type: "string",
    allowedValues: ["Academic", "Administrative", "Support", "Other"],
    errorMessage:
      "Department type must be one of: Academic, Administrative, Support, Other.",
  },
  subDepartments: {
    required: false,
    type: "array",
    item: {
      name: {
        required: true,
        type: "string",
        errorMessage: "Sub-department name is required.",
      },
      code: {
        required: true,
        type: "string",
        errorMessage: "Sub-department code is required.",
      },
      description: {
        required: false,
        type: "string",
      },

      status: {
        required: true,
        type: "string",
        allowedValues: ["active", "inactive"],
        errorMessage: "Status must be either active or inactive.",
      },
    },
  },
};

export default rules;
