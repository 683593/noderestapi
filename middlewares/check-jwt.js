const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports = function(req, resp, next) {
  let token = req.headers["authorization"];
  console.log(req.headers);
  if (token) {
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {
        resp.json({
          success: false,
          message: "Failed to authenticate token."
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    resp.status(403).json({
      success: false,
      message: "No token provided."
    });
  }
};
