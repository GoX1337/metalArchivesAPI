const req = require('./req');
const db = require('../db');
const config = require('../config');
const log = require('../logger');

db.connect(process.env.MONGODB_ADDON_URI || config.mongoUrl, process.env.MONGODB_ADDON_DB || config.database, (err) => {
    if(err) {
        log.error('Unable to connect to Mongo ' + config.database);
        process.exit(1);
    } else {
        req.startRequestBand();
    }
});