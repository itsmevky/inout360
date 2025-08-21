const rules = {
  type: {
    required: true,
    message: "Type is required",
    minLength: 3,
    maxLength: 50,
  },
  display_name: {
    required: true,
    message: "Display Name is required",
    minLength: 3,
    maxLength: 100,
  },
  modules: {
    required: false,
    isArray: true,
    message: "Modules must be an array of strings",
  },
  roles: {
    required: false,
    isArray: true,
    message: "Roles must be an array of strings",
  },
  status: {
    required: true,
    message: "Status must be either 'active' or 'disable'",
    allowed: ["active", "disable"],
  },
};

export default rules;
