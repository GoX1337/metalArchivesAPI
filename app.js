const req = require('./req');
const db = require('./db');
var config = require('./config');

let query;

if(process.argv.length > 2){
    query = process.argv[2].trim().replace(/\s+/g, "+");
} else {
    console.log("error", "Bad argument (usage: node app.js \"a metal genre\")");
    process.exit(1);
}

req.startRequestBand(query);

db.connect(config.database, (err) => {
    if (err) {
        console.log('Unable to connect to Mongo ' + config.database);
        process.exit(1);
    } else {
        req.startRequestBand(query);
    }
});