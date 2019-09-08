const express = require('express');
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

app.use(bodyParser.json());
app.use(morgan(config.morganFormat));
morgan.token('date', () => {
    return new moment().format(config.timestampFormat);
  })

app.use('/api/v1/auth', auth);
app.use('/api/v1', routes);

db.connect(process.env.MONGODB_ADDON_URI || config.mongoUrl, config.database, (err) => {
    if(err) {
        log.error('Unable to connect to Mongo ' + process.env.MONGODB_ADDON_URI || config.database);
        process.exit(1);
    } else {
        server.listen(port, () => {
            log.info('Node server API listening on port ' + port);
        });        
    }
});