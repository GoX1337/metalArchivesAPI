const req = require('./req');
const config = require('../config');
const db = require('../db');

let band = {
    "name" : "Ritualization",
    "url"  : "https://www.metal-archives.com/bands/Ritualization/121265",
    "country" : "France",
    "genre" : "Blackened Death Metal"
}

db.connect(process.env.MONGODB_ADDON_URI || config.mongoUrl, process.env.MONGODB_ADDON_DB || config.database, (err) => {
    if(err) {
        log.error('Unable to connect to Mongo ' + process.env.MONGODB_ADDON_URI || config.database);
        process.exit(1);
    } else {
        req.getBandDetails(band);     
    }
});
