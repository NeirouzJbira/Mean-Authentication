const router = require("express").Router();
var jwt = require("jsonwebtoken");
var User = require("./userModel");
var Token = require("./token");
var crypto = require("crypto");
var nodemailer = require("nodemailer");
var passport = require("passport");

const { Error } = require("mongoose");

// Register
router.post("/Register", function (req, res, next) {
  let newUser = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };
  let user = {
    email: req.body.email,
  };

  let token;
  User.addUser(newUser)
    .then((user) => {
      // console.log(user)
      // Create a verification token for this user
      token = new Token({
        _userId: user._id,
        token: crypto.randomBytes(16).toString("hex"),
      });
      // Save the verification token
      return token.save();
    })
    .then(() => {
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: "test@gmail.com", pass: "test" },
      });
      var mailOptions = {
        from: "test@gmail.com",
        to: user.email,
        subject: "Account Verification Token",
        text:
          "Hello,\n\n" +
          "Please verify your account by clicking the link: \nhttp://" +
          req.headers.host +
          "/users/confirmation/" +
          token.token +
          ".\n",
      };
      // Send the email
      return transporter.sendMail(mailOptions);
    })
    .then(() =>
      res.status(200).send({
        success: true,
        msg: "A verification email has been sent to " + user.email + ".",
      })
    )
    .catch((err) => {
      console.log(err);
      return res.json({ success: false, msg: "failed to register user " });
    });
});

/////////////////////////////////////////////////////////////////////// Authentificate
router.post("/Authentificate", function (req, res, next) {
  const username = req.body.username;
  const password = req.body.password;
  let p;
  User.getUserByUsername(username)
    .then((user) => {
      if (!user) throw new Error("user not found");
      p = user;
      return user.comparePassword(password, user.password);
    })
    .then((isMatch) => {
      // console.log(p)
      if (!isMatch) throw new Error("wrong password");
      const token = jwt.sign({ data: p._id }, "secret");
      return res.json({
        success: true,
        token: `Bearer ${token}`,
        user: {
          id: p._id,
          username: p.username,
          email: p.email,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, msg: err });
    });
});

///////////////////////////////////////////////////////////////////////////////////////CONFIRMATION  req.body.token = req.params
router.get("/confirmation/:token", function (req, res) {
  // Find a matching token
  Token.findOne({ token: req.params.token })
    .then((token) => {
      if (!token) throw new Error("not verified ");
      return User.findById(token._userId).exec();
    })
    .then((user) => {
      if (!user)
        throw new Error("We were unable to find a user for this token.");
      if (user.isVerified) throw new Error("already-verified");
      // Verify and save the user
      user.isVerified = true;
      return user.save();
    })
    .then(() => {
      return res.json({
        success: true,
        msg: "The account has been verified. Please log in.",
      });
    })
    .catch((err) => {
      // console.log(err.message,typeof(err))
      return res.status(400).json({ success: false, msg: err.message });
    });
});

//////////////////////////////////////////////////// PROFILE

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.json({ user: req.user });
  }
);

module.exports = router;
