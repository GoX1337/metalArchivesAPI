const req = require('./req');

let query;


if(process.argv.length > 2){
    query = process.argv[2].trim().replace(/\s+/g, "+");
} else {
    console.log("error", "Bad argument (usage: node app.js \"a metal genre\")");
    process.exit(1);
}

req.startRequestBand(query);

