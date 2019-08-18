const router = require("express").Router();
const Product = require("../models/product");
const checkJWT = require("../middlewares/check-jwt");
const faker = require("faker");
/**
 * Amazon Tools
 * */
const aws = require("aws-sdk");
const multer = require("multer");
const multers3 = require("multer-s3");

const s3 = new aws.S3({
  accessKeyId: "AKIAJOJVKDHYMNAFWUMA",
  secretAccessKey: "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"
});

//image upload function to amazon S3 Storage

const upload = multer({
  storage: multers3({
    s3: s3,
    bucket: "meanstack",
    metadata: function(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function(req, file, cb) {
      cb(null, Date.now().toString());
    }
  })
});
/**
 * fetch Single Product
 */
router.get("/product", checkJWT, (req, resp, next) => {
      console.log("/product class====\n");
      console.log(req.headers);
      Product.findOne({
        seller: req.decoded.user._id,
        _id: req.headers.hashkey
      })
        //.where('_id').equals(req.headers.id)
        .populate("seller")
        .populate("category")
        .sort({ name: 1 })
        .exec((err, product) => {
          if (err) return next(err);
          resp.json({
            success: true,
            product: product,
            message: "success"
          });
        });
});
router
  .route("/products")
  .get(checkJWT, (req, resp, next) => {
    Product.find({
      seller: req.decoded.user._id
    })

      .populate("seller")
      .populate("category")
      .sort({ name: 1 })
      .exec((err, products) => {
        if (err) return next(err);
        resp.json({
          success: true,
          products: products,
          message: "success"
        });
      });
  })
  .post([checkJWT, upload.single("product_picture")], (req, resp, next) => {
    console.log("header info");
    console.log(req.header);
    let p = new Product();
    p.seller = req.decoded.user._id;
    p.category = req.body.categoryId;
    //p._id = req.body._id ? req.body._id : null ;
    p.title = req.body.title;
    p.price = req.body.price;
    p.discount = req.body.discount;
    p.stock = req.body.stock;
    p.description = req.body.description;
    p.image = req.file.location;
    p.save((err, p) => {
      err
        ? resp.json({
            success: false,
            message: "Product Could not Saved. Error: " + err
          })
        : resp.json({
            success: true,
            message: "Product [ " + p.title + " ] Saved Succcessfully!"
          });
    });
  });
/**
 * Just for test
 */
router.get("/faker/test", (req, resp, next) => {
  for (var i = 0; i <= 20; i++) {
    let product = new Product();
    product.title = faker.commerce.productName();
    product.description = faker.commerce.productMaterial();
    product.seller =
      i % 2 == 0 ? "5ae644365c94030f70e076a8" : "5ae4d3c9a5d8ff033453ca70";
    product.category =
      i % 2 == 0 ? "5ae79bc41ebc3604e8cd9c92" : "5ae79ba51ebc3604e8cd9c91";
    product.price = faker.commerce.price();
    product.stock = 5;
    product.image = faker.image.fashion();
    product.discount = parseFloat(i / 5);
    product.save();
  }
  resp.json({
    message: "Fake products added successfully"
  });
});
module.exports = router;
