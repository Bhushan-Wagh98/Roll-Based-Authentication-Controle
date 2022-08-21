const { body } = require("express-validator");
module.exports = {
  registerValidator: [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Email must be a valid email!")
      .normalizeEmail()
      .toLowerCase(),
    body("password")
      .trim()
      .isLength(8)
      .withMessage("Password must require minimum 8 character!"),
    body("password2").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password do not match!");
      }
      return true;
    }),
  ],
};
