const Sentry = require("@sentry/node");
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

router.get("/v1/service-alpha/private", (req, res) => {
  throw new Error("Conexion perdida con la BDD");
});

router.get("/v1/service-beta/private", async (req, res) => {
  try {

    throw new Error("Error interno en service beta");

  } catch (err) {

    Sentry.captureException(err, {
      tags: {
        service: "beta",
        endpoint: "private"
      },

      extra: {
        user: "usuario-demo",
        module: "service-beta"
      }
    });

    return res.status(500).json({
      error: "Error registrado en Sentry"
    });
  }
});

router.get("/v1/service-beta/protected", (req, res) => {

  const autorizado = false;

  if (!autorizado) {
    return res.status(401).json({
      error: "Token invalido o expirado"
    });
  }

});
module.exports = router;