const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const config = require("../config");

const checkJWT = require("../middlewares/check-jwt");

//APIs

//Register new user or saving records for user.
router.post("/signup", (req, resp, next) => {
  //console.log("inside router.post!  wooo hooo");
  //console.log(req.body);
  let user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password;
  user.picture = user.gravatar();
  user.isSeller = req.body.isSeller;

  User.findOne(
    {
      email: req.body.email
    },
    (err, existingUser) => {
      if (existingUser) {
        resp.json({
          success: false,
          account:
            "Account with this user email is already exist, please add new one!"
        });
      } else {
        user.save();
        var token = jwt.sign(
          {
            user: user
          },
          config.secret,
          {
            expiresIn: "7d"
          }
        );

        resp.json({
          success: true,
          message: "Enjoy your Token!",
          token: token
        });
      }
    }
  );
});

//Login user
router.post("/login", (req, resp, next) => {
  let user = new User();
  user.email = req.body.email;
  user.password = req.body.password;
  User.findOne(
    {
      email: req.body.email
    },
    (err, user) => {
      if (err) throw err;
      if (!user) {
        resp.json({
          success: false,
          message: req.body.email + ", is not registered with us, Login Failed!"
        });
      } else if (user) {
        console.log(user);
        var passwordValidation = user.comparePassword(req.body.password);
        console.log(passwordValidation);
        if (!passwordValidation) {
          resp.json({
            success: false,
            message: "Authentication failed!, entered wrong password!"
          });
        } else {
          var token = jwt.sign(
            {
              user: user
            },
            config.secret,
            {
              expiresIn: "7d"
            }
          );

          resp.json({
            success: true,
            token: token,
            message:
              "Welcome Back! Mr./Ms. " +
              user.name +
              ", You have logged in successfully."
          });
        }
      }
    }
  );
});

router
  .route("/profile")
  .get(checkJWT, (req, resp, next) => {
    User.findOne(
      {
        _id: req.decoded.user._id
      },
      (err, user) => {
        resp.json({
          success: true,
          user: user,
          message: "Successful"
        });
      }
    );
  })
  .post(checkJWT, (req, resp, next) => {
    User.findOne(
      {
        _id: req.decoded.user._id
      },
      (err, user) => {
        if (err) return next(err);
        if (req.body.name) user.name = req.body.name;
        if (req.body.email) user.email = req.body.email;
        if (req.body.password) user.password = req.body.password;
        if (req.body.picture) user.picture = req.body.picture;
        user.isSeller = req.body.isSeller ? true : false;

        user.save();

        resp.json({
          success: true,
          message: "Profile updated successfully!"
        });
      }
    );
  });

//Adress

router
  .route("/address")
  .get(checkJWT, (req, resp, next) => {
    User.findOne(
      {
        _id: req.decoded.user._id
      },
      (err, user) => {
        if (err) return next(err);
        resp.json({
          success: true,
          address: user.address,
          message: "success"
        });
      }
    );
  })
  .post(checkJWT, (req, resp, next) => {
    User.findOne(
      {
        _id: req.decoded.user._id
      },
      (err, user) => {
        if (err) return next(err);
        console.log(req.body);
        if (req.body.addr1) user.address.addr1 = req.body.addr1;
        if (req.body.addr2) user.address.addr2 = req.body.addr2;
        if (req.body.city) user.address.city = req.body.city;
        if (req.body.state) user.address.state = req.body.state;
        if (req.body.country) user.address.country = req.body.country;
        if (req.body.postalcode) user.address.postalcode = req.body.postalcode;
        user.save();
        resp.json({
          success: true,
          message: "Address updated successfully!"
        });
      }
    );
  });
module.exports = router;
