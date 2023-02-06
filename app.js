const express = require("express");
const app = express();

require("ejs");

const { urlencoded } = require("body-parser");
const mongoose = require("mongoose");
const encryption = require("mongoose-encryption")

// require('dotenv').config()
// const mongodbPass = process.env.mongodbpass;

// mongoose.connect(
//   "mongodb+srv://vignesh-admin:"+mongodbPass+"@cluster23.2fymgyj.mongodb.net/"
// );
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/userdb");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});



const User = mongoose.model("User", userSchema);

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
    const newUser = new User({
      email: req.body.username,
      password: req.body.password,
    });
    newUser.save((err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
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
    User.findOne({ email: username}, (err, user) => {
     if(err){
      res.send(err)
     }else{
      if(user){
            if(user.email===username && user.password === passWord ){
              res.render("secrets");
              console.log(user.email,user.password);
            }else{
              res.send("your password is wrong")
            }
          }else{
        res.send("your Email or password is incorrect")
      }
     }
    }
    );
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("serve is running on port " + port);
});
