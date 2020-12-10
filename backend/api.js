const express = require('express');
// const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use("/api/test", require("./api/test") );
// app.use("/api/getRecent", require("./api/getRecent") );
app.use("/api/samples", require("./api/samples") );
app.use("/api/proxy", require("./api/proxy") );

module.exports = app;
