var createError = require("http-errors");
const express = require("express");
var path = require("path");
const mongoose = require("mongoose");
var User = require("./userModel");
var Token = require("./token");
const passport = require("passport");
const bodyParser = require("body-parser");
const fs = require("fs");

require("dotenv").config();
const app = express();

// CONFIRMATION EMAIL
var crypto = require("crypto");
var nodemailer = require("nodemailer");

// ADDING MONGOOSE
mongoose.connect(
  process.env.MONGODB_CONNECTION_STRING,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
  (err) => {
    if (err) throw err;
    console.log("MONGO connected");
  }
);

//REGISTER & LOGIN
const usersRouter = require("./user");

// ADDING CORS
var cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:4000",
  })
);

// SET STATIC FOLDER
app.use(express.static(path.join(__dirname, "public")));

// ADDING BODY-PARSER middlware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// PASSPORT middlware
app.use(passport.initialize());
app.use(passport.session());
require("./passport")(passport);

app.use("/users", usersRouter);
// INDEX ROUTE
app.get("/", (req, res) => {
  res.send("invalid endpoint");
});

// START SERVER
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`the server is running on port : ${PORT}`));
