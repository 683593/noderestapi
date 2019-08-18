const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const deepPopulate = require('mongoose-deep-populate')(mongoose);
const mongooseAlgolia = require('mongoose-algolia');

const ProductSchema = new Schema({
  title: {
    type: String
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category"
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }],
  price: Number,
  image: String,
  discount: Number,
  stock: Number,
  description: String,
  created: Date,
  updated: Date
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }

});

ProductSchema
  .virtual('averageRatings')
  .get(function () {
    var rating = 0;
    if (this.reviews.length == 0) rating = 0;
    else
      this.reviews.map((review) => {
        rating += review.rating;
      });

    return rating = rating / this.reviews.length;
  })

ProductSchema.plugin(deepPopulate);
ProductSchema.plugin(mongooseAlgolia, {
  appId: 'T3ZK4AEKKP',
  apiKey: 'fd51510ed1c219f510a5e2760b9c8033',
  indexName: 'Rizwaan', //The name of the index in Algolia, you can also pass in a function
  selector: '_id title description image reviews price owner created avgRatings', //You can decide which field that are getting synced to Algolia (same as selector in mongoose)
  populate: {
    path: 'owner reviews',
    select: 'name rating'
  },
  defaults: {
    author: 'unknown'
  },
  mappings: {
    title: function (value) {
      return `${value}`
    }
  },
  virtuals: {
    avgRatings: function (doc) {
      var rating = 0;
      if (doc.reviews.length == 0) rating = 0;
      else {
        doc.reviews.map((review) => {
          rating += review.rating;
        });

        rating = rating / doc.reviews.length;
      }
      return rating;
    }

  },
  filter: function (doc) {
    return !doc.softdelete
  },
  debug: true // Default: false -> If true operations are logged out in your console
});

ProductSchema.pre("save", function (next) {
  var product = this;
  now = new Date();
  product.updated = now;

  if (!product.created) {
    product.created = now;
  }
  next();
});
// old script
//module.exports = mongoose.model('Product', ProductSchema);
//after algolia
let Model = mongoose.model('Product', ProductSchema);

Model.SyncToAlgolia(); //Clears the Algolia index for this schema and synchronizes all documents to Algolia (based on the settings defined in your plugin settings)
Model.SetAlgoliaSettings({
  searchableAttributes: ['title'] //Sets the settings for this schema, see [Algolia's Index settings parameters](https://www.algolia.com/doc/api-client/javascript/settings#set-settings) for more info.
});
module.exports = Model;