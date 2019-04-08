const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

// Load user model
const User = require("../../models/User");
//Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

//@route POST api/users/register
//@desc Register user
//@access public
router.post("/register", (req, res) => {
  const { errors, isvalid } = validateRegisterInput(req.body);
  //check validation
  if (!isvalid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        errors.email = "Email already exists";
        return res.status(400).json(errors);
      } else {
        const avatar = gravatar.url(req.body.email, {
          s: "200",
          r: "pg",
          d: "mm"
        });
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          avatar
        });

        bcrypt.genSalt(10, (err, salt) => {
          if (err) {
            errors.password = "Failed encrypting";
            return res.status(400).json(errors);
          }
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
              errors.password = "Failed hashing";
              return res.status(400).json(errors);
            }
            newUser.password = hash;
            newUser
              .save()
              .then(User => res.json(User))
              .catch(err => console.log(err));
          });
        });
      }
    })
    .catch();
});
//@route POST api/users/register
//@desc Register user
//@access public
router.post("/login", (req, res) => {
  const { errors, isvalid } = validateLoginInput(req.body);

  //check validation
  if (!isvalid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        errors.email = "user not found";
        return res.status(400).json(errors);
      }

      //check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          //user matched
          const payload = {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          };
          //sign token
          jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 3600 },
            (err, token) => {
              return res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
        } else {
          errors.password = "password Incorrect";
          return res.status(400).json(errors);
        }
      });
    })
    .catch(err => console.log(err));
});
//@route POST api/users/current
//@desc Register user
//@access private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
