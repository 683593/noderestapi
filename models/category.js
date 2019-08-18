const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: { type: String, unique: true, lowercase: true },
  created: { type: Date },
  updated: { type: Date }
});

//before save need to encrypt password
CategorySchema.pre("save", function(next) {
  var category = this;
  //set created and updated date
  now = new Date();
  category.updated = now;
  if (!category.created) {
    category.created = now;
  }

  next();
});
module.exports = mongoose.model("Category", CategorySchema);
