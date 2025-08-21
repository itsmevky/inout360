  const rules = {
  room_number: {
    required: true,
    type: "string",
    errorMessage: "Room number is required and must be a string.",
  },
  room_name: {
    required: true,
    type: "string",
    errorMessage: "Name is required and must be a string.",
  },
  floor: {
    required: true,
    type: "number",
    errorMessage: "Floor is required and must be an integer.",
  },
  capacity: {
    required: true,
    type: "number",
    errorMessage: "Capacity is required and must be an integer.",
  },
  type: {
    required: false,
    type: "string",
    allowedValues: [
      "Classroom",
      "Laboratory",
      "Library",
      "Office",
      "Auditorium",
      "Other",
    ],
    errorMessage:
      "Type must be one of: Classroom, Laboratory, Library, Office, Auditorium, Other.",
  },
status: {
    required: true,
    type: "string",
    allowedValues: ["active", "inactive"],
    errorMessage: "Status must be either active or inactive.",
  },
};

export default rules;