const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//include config
const config = require("./config");
const cors = require('cors');

//connect Mongo database.
mongoose.connect(config.database, {
  useNewUrlParser: true,
  autoReconnect: true
}, err => {
  if (err) {
    console.log(err);
  } else {
    console.log("yippie yippie Hurray!! mongo db Connected");
  }
});

//initialize express.
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(morgan("dev"));
//Middleware Cors
app.use(cors());

const userRoutes = require('./routes/account');
const mainRoutes = require('./routes/main');
const sellerRoutes = require('./routes/seller');
const productSearchRoutes = require('./routes/product-search');

app.use('/api', mainRoutes);
app.use('/api/accounts', userRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/search', productSearchRoutes);

app.get("/", (req, res, next) => {
  res.json({
    user: "Mohammad Rizwaan"
  });
});

app.listen(config.port, err => {
  console.log("Hello Rizwaan!! Hurray! server started on dynamic port  " + config.port);
});