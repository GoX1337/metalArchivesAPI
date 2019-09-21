const express = require('express');
const rateLimit = require("express-rate-limit");
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const morgan = require('morgan');
const moment = require('moment');
const log = require('./logger');
const db = require('./db');
const config = require('./config');
const auth = require('./auth');
const routes = require('./routes');

const port = process.env.PORT || 1337;

if(!process.env.APISECRET){
    log.error('Define APISECRET env var');
    process.exit(1);
}

app.use(bodyParser.json());
app.use(morgan(config.morganFormat));
morgan.token('date', () => {
    return new moment().format(config.timestampFormat);
})

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
});
app.use('/api/v1', apiLimiter);

app.use('/api/v1/auth', auth);
app.use('/api/v1', routes);

db.connect(process.env.MONGODB_ADDON_URI || config.mongoUrl, process.env.MONGODB_ADDON_DB || config.database, (err) => {
    if(err) {
        log.error('Unable to connect to Mongo ' + process.env.MONGODB_ADDON_URI || config.database);
        process.exit(1);
    } else {
        server.listen(port, () => {
            log.info('Node server API listening on port ' + port);
        });        
    }
});