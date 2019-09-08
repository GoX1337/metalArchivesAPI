const req = require('./req');
const db = require('../db');
const config = require('../config');

db.connect(config.mongoUrl, config.database, (err) => {
    if(err) {
        console.log('Unable to connect to Mongo ' + config.database);
        process.exit(1);
    } else {
        req.startRequestBand();
    }
});