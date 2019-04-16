const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

//Load user model
const User = require("../../models/User");

//Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

//@route  POST api/user/register
//@desc Register User
//@access public

router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  //Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        errors.email = "Email already exist";
        return res.status(400).json({ errors });
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
            errors.password = "Password Falied Encrypting";
            return res.status(400).json({ errors });
          }

          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
              errors.password = "Hashing Falied Encrypting";
              return res.status(400).json({ errors });
            }
            newUser.password = hash;
            newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          });
        });
      }
    })
    .catch(err => console.log(err));
});

//@route  POST api/user/login
//@desc Login User
//@access public

router.post("/login", (req, res) => {
  console.log("Login: " + req.body.email);
  console.log("Login: " + req.body.password);
  const { errors, isValid } = validateLoginInput(req.body);
  console.log("Login Validation: " + errors);
  //Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email })
    .then(user => {
      if (!user) {
        errors.email = "User not found";
        return res.status(400).json({ errors });
      }

      //Check Password

      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          //User macthed
          const payload = {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          };

          //Sign token
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
          errors.password = "Password Incorrect";
          return res.status(400).json({ errors });
        }
      });
    })
    .catch(err => console.log(err));
});

//@route  GET api/user/profile
//@desc return current user info
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
