global.__basedir = __dirname;
require('dotenv').config();
const express = require('express');
// const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

const bot = require("./js/TelegramBot");

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/test", require("./api/test") );
app.use("/api/getRecent", require("./api/getRecent") );
app.use("/api/samples", require("./api/samples") );

module.exports = app;
