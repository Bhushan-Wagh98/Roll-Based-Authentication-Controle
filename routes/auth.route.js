const router = require("express").Router();
const User = require("../models/user.model");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

router.get("/login", async (req, res, next) => {
  res.render("login");
});

router.get("/register", async (req, res, next) => {
  res.render("register");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/user/profile",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })
);

router.post(
  "/register",
  [
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
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
          req.flash("error", error.msg);
        });
        res.render("register", {
          email: req.body.email,
          messages: req.flash(),
        });
        return;
      }

      const { email } = req.body;
      const doesExist = await User.findOne({ email });
      if (doesExist) {
        res.redirect("/auth/register");
        return;
      }

      const user = new User(req.body);
      await user.save();
      req.flash("success", `${user.email} registered successfully!`);
      res.redirect("/auth/login");
    } catch (error) {
      next(error);
    }
  }
);

router.get("/logout", async (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
