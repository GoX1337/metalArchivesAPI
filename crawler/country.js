const db = require('../db');
const config = require('../config');
let query;

if(process.argv.length > 2){
    query = process.argv[2].trim().replace(/\s+/g, "+");
} else {
    console.log("error", "Bad argument (usage: node app.js \"a metal genre\")");
    process.exit(1);
}

db.connect(config.database, (err) => {
    if(err) {
        console.log('Unable to connect to Mongo ' + config.database);
        process.exit(1);
    } else {
        let countries = [];

        db.get().collection(query).find().toArray((err, result) => {
            if(!err){
                result.forEach((b) => {
                   let c = b.country;
                   let l = b.location;
                   let found = false;

                   for(let i = 0; i < countries.length; i++){
                       if(countries[i].name == c){
                            found = true;
                            if(!countries[i].locations.includes(l)){
                                countries[i].locations.push(l);
                            }
                       }
                   }
                   if(!found)
                     countries.push({name: c, locations:[l]});
                });

                db.get().collection("countries").insertMany(countries, (err, res) => {
                    if (err) throw err;
                    console.log("Number of documents inserted: " + res.insertedCount);
                    db.get().close();
                });
            }
        });
    }
});