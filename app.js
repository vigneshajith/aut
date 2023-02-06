require("dotenv").config();
const express = require("express");
const app = express();

require("ejs");

const { urlencoded } = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

// const mongodbPass = process.env.MONGODBPASS;
const secrets = process.env.SECRET;
// mongoose.connect(
//   "mongodb+srv://vignesh-admin:"+mongodbPass+"@cluster23.2fymgyj.mongodb.net/"
// );
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/userdb");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// const secrets = "This a secret";

userSchema.plugin(encrypt, { secret: secrets, encryptedFields: ["password"] });

const User = mongoose.model("User", userSchema);

// User.find({}, (err, user) => {
//   console.log(user);
// });

app.use(express.static("public"));
app.use(urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home");
});

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    newUser = new User({
      email: req.body.username,
      password: req.body.password,
    });

    newUser.save((err, result) => {
      if (result) {
        res.render("secrets");
      } else {
        res.render(err);
      }
    });
  });

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const username = req.body.username;
    const passWord = req.body.password;
    console.log(username);
    User.findOne({ email: req.body.username }, (err, user) => {
      console.log(user);
      if (user) {
        if (user.password === passWord) {
          res.render("secrets");
        } else {
          res.send("password is incorrect");
        }
      } else {
        res.send("email is not fount");
      }
    });
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("serve is running on port " + port);
});
