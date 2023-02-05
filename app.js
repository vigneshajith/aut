const express = require('express');
const app = express();

require('ejs')

const {urlencoded} = require('body-parser');
const mongoose  = require('mongoose')

// require('dotenv').config()
// const mongodbPass = process.env.mongodbpass;

// mongoose.connect(
//   "mongodb+srv://vignesh-admin:"+mongodbPass+"@cluster23.2fymgyj.mongodb.net/"
// );
mongoose.set("strictQuery", false);
mongoose.connect('mongodb://127.0.0.1:27017/userdb')

const userSchema = mongoose.Schema({
    email: String,
    password:String
})


const UserId = mongoose.model("UserId", userSchema);




app.use(express.static('public'));
app.use(urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render("home")
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("serve is running on port "+port);
})
