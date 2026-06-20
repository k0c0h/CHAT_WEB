//inicializo sentry antes que express
require('./instrument');
const express = require('express');
const {createServer } = require('http');
const Sentry = require("@sentry/node")
const path = require('path');
const cookieParser = require("cookie-parser");
const configureRealTimeServer = require('./realTimeServer');
console.log("SENTRY_DSN =", process.env.SENTRY_DSN);
require('dotenv').config({ path: path.join(__dirname, '.env') });
const database = require('./db');

const app = express();
const webServer = createServer(app);

app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());

app.use(require("./routes"));

app.use(express.static(path.join(__dirname, "public")));
app.get("/debug-sentry", (req, res) =>{
    throw new Error("Prueba sentry: error intencional en el backend")
});

Sentry.setupExpressErrorHandler(app)

database.connect().then(() => {
    webServer.listen(app.get("port"), () => {
        console.log("La aplicación esta corriendo en el puerto", app.get("port"));
    });

    configureRealTimeServer(webServer);
});
