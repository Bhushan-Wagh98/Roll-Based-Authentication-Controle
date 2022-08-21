const router = require("express").Router();
const Users = require("../models/user.model");
const mongoose = require("mongoose");
const User = require("../models/user.model");
const roles = require("../utils/constants");

router.get("/users", async (req, res, next) => {
  try {
    const users = await Users.find();
    res.render("manageUsers", { users });
  } catch (error) {
    next(error);
  }
});

router.get("/user/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash("error", "Invalid ID!");
      res.redirect("/admin/users");
      return;
    }
    const person = await Users.findOne({ id });
    res.render("profile", { person });
  } catch (error) {
    console.log(error);
  }
});

router.post("/update-role", async (req, res, next) => {
  const { id, role } = req.body;
  if (!id || !role) {
    req.flash("error", "Invalid request!");
    return res.redirect("back");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid ID!");
    return res.redirect("back");
  }

  const rolesArr = Object.values(roles.roles);
  if (!rolesArr.includes(role)) {
    req.flash("error", "Invalid role!");
    return res.redirect("back");
  }

  if (req.user.id === id) {
    req.flash(
      "error",
      "Admin cannot remove themselves from admin, ask another admin!"
    );

    return res.redirect("back");
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  );
  req.flash("info", `Updated role for ${user.email} to ${user.role}`);
  res.redirect("back");
});

module.exports = router;
