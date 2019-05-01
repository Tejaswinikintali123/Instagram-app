// please ignore to checkin.
const Jwtstrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
// const Mongoose = require("mongoose");
// const user = mongoose.model("users");
const keys = require("../config/keys");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;
console.log(opts);
module.exports = passport => {
  passport.use(
    new Jwtstrategy(opts, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
        // console.log(jwt_payload);
        .then(user => {
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch(err => console.log(err));
    })
  );
};
