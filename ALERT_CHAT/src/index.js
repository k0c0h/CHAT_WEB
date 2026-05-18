const express = require('express');
const {createServer } = require('http');
const path = require('path'); //direccion
const cookieParser = require("cookie-parser");
const realTimeServer = require('./realTimeServer');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./db');

const app = express(); //creando una aplicacion con express
const httpServer = createServer(app); //permite hacer peticiones al servidor

app.set("port", process.env.PORT || 3000);
app.set("view",path.join(__dirname, "views"));
app.use(cookieParser());

app.use(require("./routes"));

app.use(express.static(path.join(__dirname, "public")));

db.connect().then(() => {
    httpServer.listen(app.get("port"), () => {
        console.log("La aplicación esta corriendo en el puerto", app.get("port"));
    });

    realTimeServer(httpServer);
});
