// NPM REQUEST
require("dotenv").config();
require("ejs");
const express = require("express");
const { urlencoded } = require("body-parser");

const mongoose = require("mongoose");
// npm for authentication 
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose"); 
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
// passport-local don't want to require  
const port = 3000 || process.env.PORT;
const app = express();

app.use(express.static("public"));
app.use(urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(session({
  secret: process.env.SECRET_STRING,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize())
app.use(passport.session());
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URL);

const userSchema = new mongoose.Schema({
  email: { type: String, require: true },
  password: { type: String, require: true },
  googleId: String,
  secret:String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture,
    });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://secrets-kb5u.onrender.com/auth/google/secrets",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect secrets.
    res.redirect("/secrets");
  }
);

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    User.register({ username: email }, password, (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        });
      }
    });


  });

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    const user = new User({
      username: email,
      password : password
    })

    req.login(user, (err) => {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets")
        })
      }
    })

  });


app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (!err) {
      res.redirect("/")
    } 
  });
});

app.get("/secrets", (req, res) => {

  User.find({ "secret": { $ne: null } }, (err, secrets) => {

    if (err) {
      console.log(err)
    } else {
      secrets.map((data) => {
      res.render("secrets",{userWithSecrets: secrets})
      })
    }
  })

});

app.route("/submit").get((req, res) => {
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }
})
  .post((req, res) => {
    const submitedSecret = req.body.secret;
    User.findById(req.user.id, (err, user) => {
      if (err) {
        console.log(err);
      } else {
        if (user) {
          user.secret = submitedSecret;
          user.save(() => {
            res.redirect("/secrets")
          });
        }
      }
    })
})



app.listen(port, () => {
  console.log("server is running on port " + port);
});
