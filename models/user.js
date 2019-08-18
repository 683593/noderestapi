const mongoos = require("mongoose");
const Schema = mongoos.Schema;
const bcrypt = require("bcrypt-nodejs");
const crypto = require("crypto");

const SALT_WORK_FACTOR = 10;

const UserSchema = new Schema({
  email: { type: String, unique: true, lowercase: true },
  name: String,
  password: { type: String },
  picture: String,
  isSeller: { type: Boolean, default: false },
  address: {
    addr1: String,
    addr2: String,
    city: String,
    state: String,
    country: String,
    postalcode: String
  },
  created: { type: Date },
  updated: { type: Date }
});

//Mongoose function
//before save need to encrypt password
UserSchema.pre("save", function(next) {
  var user = this;

  if (!user.isModified("password")) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(
      user.password,
      salt,
      function() {},
      function(err, hash) {
        if (err) return next(err);
        user.password = hash;

        //set created and updated date
        now = new Date();
        user.updated = now;
        if (!user.created) {
          user.created = now;
        }

        next();
      }
    );
  });
});

//Custom Function
//Compare password
UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

//Generate Avatar image by email by calling api for free.

UserSchema.methods.gravatar = function(size) {
  if (!this.size) size = 300;
  if (!this.email) {
    return "https://gravatar.com/avatar/?s" + size + "&d=robohash";
  } else {
    var md5 = crypto
      .createHash("md5")
      .update(this.email)
      .digest("hex");

    return "https://gravatar.com/avatar/" + md5 + "?s" + size + "&d=robohash";
  }
};

module.exports = mongoos.model("User", UserSchema);
