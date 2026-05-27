const express = require("express");
const router = express.Router();
const path = require("path");
const validateAuthenticatedSession = require("../middleware/isLoggedIn");
const viewsPath = path.join(__dirname, "/../views");

router.get("/", validateAuthenticatedSession, (request, response) => {
  response.sendFile(viewsPath + "/index.html");
});

router.get("/register", (request, response) => {
  response.sendFile(viewsPath + "/register.html");
});

module.exports = router;