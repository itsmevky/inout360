const mongoose = require("mongoose");

class Validator {
  constructor(data, rules, models = {}) {
    this.data = data;
    this.rules = rules;
    this.models = models;
    this.errors = {};
  }

  validate() {
    for (const field in this.rules) {
      const value = this.data[field];
      const fieldRules = this.rules[field];

      for (const rule of fieldRules) {
        let ruleName, param;

        if (typeof rule === "string" && rule.includes(":")) {
          [ruleName, param] = rule.split(":");
        } else {
          ruleName = rule;
        }

        switch (ruleName) {
          case "required":
            if (!value || value.toString().trim() === "") {
              this.addError(field, `${field} is required`);
            }
            break;

          case "email":
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              this.addError(field, `${field} must be a valid email`);
            }
            break;

          case "min":
            if (value && value.length < parseInt(param)) {
              this.addError(
                field,
                `${field} must be at least ${param} characters`
              );
            }
            break;

          case "max":
            if (value && value.length > parseInt(param)) {
              this.addError(
                field,
                `${field} must be at most ${param} characters`
              );
            }
            break;

          case "enum":
            const allowed = param.split(",");
            if (value && !allowed.includes(value)) {
              this.addError(
                field,
                `${field} must be one of: ${allowed.join(", ")}`
              );
            }
            break;

          case "match":
            if (value !== this.data[param]) {
              this.addError(field, `${field} must match ${param}`);
            }
            break;

          // Ignore "unique" in sync validation; handled in async
        }
      }
    }

    return Object.keys(this.errors).length === 0;
  }

  async validateAsync() {
    for (const field in this.rules) {
      const value = this.data[field];
      const fieldRules = this.rules[field];

      for (const rule of fieldRules) {
        if (typeof rule === "string" && rule.startsWith("unique:")) {
          const [, modelAndField] = rule.split(":");
          const [modelName, fieldName = field] = modelAndField.split(".");

          const Model = this.models[modelName];
          if (!Model) {
            throw new Error(`Model "${modelName}" not provided`);
          }

          const existing = await Model.findOne({ [fieldName]: value });
          if (existing) {
            this.addError(field, `${field} already exists`);
          }
        }
      }
    }

    return Object.keys(this.errors).length === 0;
  }

  addError(field, message) {
    if (!this.errors[field]) {
      this.errors[field] = [];
    }
    this.errors[field].push(message);
  }

  getErrors() {
    return this.errors;
  }
}

module.exports = Validator;
