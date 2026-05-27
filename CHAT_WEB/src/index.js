const express = require('express');
const {createServer } = require('http');
const path = require('path');
const cookieParser = require("cookie-parser");
const configureRealTimeServer = require('./realTimeServer');
require('dotenv').config();
const database = require('./db');

const app = express();
const webServer = createServer(app);

app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());

app.use(require("./routes"));

app.use(express.static(path.join(__dirname, "public")));

database.connect().then(() => {
    webServer.listen(app.get("port"), () => {
        console.log("La aplicación esta corriendo en el puerto", app.get("port"));
    });

    configureRealTimeServer(webServer);
});