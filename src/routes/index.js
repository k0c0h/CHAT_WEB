const express = require("express");
const router = express.Router();
const path = require("path");
const isLoggedIn = require("../middleware/isLoggedIn")
const views = path.join(__dirname, "/../views");

router.get("/", isLoggedIn, (req, res) => { //se hace la peticion al servidor y se hace isLoggedIn
  res.sendFile(views + "/index.html");
});

router.get("/register", (req, res) => {
  if (req.cookies.username) {
    return res.redirect("/");
  }

  res.sendFile(views + "/register.html");
});

module.exports = router;