const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateLoginInput(data) {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (validator.isEmpty(data.email)) {
    errors.email = "Email Is Required";
  }

  if (!validator.isEmail(data.email)) {
    errors.email = "Email Is Invalid";
  }

  if (!validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be between 6 and 30 characters";
  }
  if (validator.isEmpty(data.password)) {
    errors.password = "Password Is Required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
