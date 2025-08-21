const rules = {
  name: {
    required: true,
    message: "Name is required",
    minLength: 3,
    maxLength: 100,
  },
  subdomain: {
    required: false,
    message: "subdomain  is required",
    minLength: 0,
    maxLength: 150,
  },
  domain: {
    required: false,
    message: "domain is required",
    minLength: 0,
    maxLength: 150,
  },
  database: {
    required: false,
    message: "database is required",
    minLength: 0,
    maxLength: 150,
  },

  required: {
    required: false,
    message: "Field is required",
  },
  status: {
    required: false,
    message: "Status must be either 'active' or 'inactive'",
    validStatuses: ["active", "inactive"],
  },
};

export default rules;
