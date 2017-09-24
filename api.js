const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const db = require('./db');
const config = require('./config');

const port = 1337;

server.listen(port, function() {
    logger.info('Node server API listening on port ' + port);
});