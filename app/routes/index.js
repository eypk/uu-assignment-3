const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const authController = require("../controller/authController");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./utils/database.db");
const dotenv = require("dotenv");
const {
  getMovies,
  getMovie,
  getOrderHistory,
} = require("../helper/fetchMovieData");

dotenv.config();

/* GET home page. */
// private & public route
router.use(morgan("dev")).get("/", authController, async (req, res) => {
  const user = req.user;
  const movies = await getMovies(db);

  if (user == {}) {
    res.render("home", {
      title: "Home Page",
      movies: movies,
      user: {},
    });
  } else {
    res.render("home", {
      title: "Home Page",
      movies: movies,
      user: user,
    });
  }
});

/* GET user page. */
// route /user
// private route
router.use(morgan("dev")).get("/user", authController, async (req, res) => {
  const order_history = await getOrderHistory(db, req.user.id);

  if (req.user) {
    db.get("SELECT * FROM users WHERE id = ?", [req.user.id], (err, user) => {
      if (err) {
        console.error(err.message);
        res.status(500).send("Internal server error");
      } else if (!user) {
        res.status(404).send("User not found");
      } else {
        user = { ...user, password: "**********" };
        console.log("userData", user, order_history);
        res.render("user", {
          title: "User Page",
          user: user,
          movies: order_history,
        });
      }
    });
  } else {
    res.status(401).send({ msg: "Authorization Required" });
  }
});

/* GET moviedetail page. */
// route movies/:id
// private & public route
router.use(morgan("dev")).get("/movies/:id", authController, (req, res) => {
  const id = req.params.id;
  const user = req.user;

  // Query the database to retrieve the movie with the specified ID

  db.get("SELECT * FROM movies WHERE id = ?", [id], (err, movie) => {
    if (err) {
      console.error(err.message);
      res.status(500).send("Internal server error");
    } else if (!movie) {
      res.status(404).send("Movie not found");
    } else {
      res.render("movieDetail", {
        title: "Movie Detail",
        data: movie,
        user: user,
      });
    }
  });
});

/* GET login page. */
// public route
router.use(morgan("dev")).get("/login", (req, res) => {
  res.render("login", { title: "Login Page", user: {} });
});

/* GET lgin page. */
// public route
router.use(morgan("dev")).get("/register", (req, res) => {
  res.render("register", { title: "Register Page", user: {} });
});

module.exports = router;
