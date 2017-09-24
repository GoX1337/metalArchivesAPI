const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const morgan = require('morgan');
const db = require('./db');
const config = require('./config');
const routes = require('./routes');

const port = process.argv.length >= 3 ? process.argv[2] : 1337;

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use('/api', routes);

db.connect(config.database, (err) => {
    if(err) {
        console.log('Unable to connect to Mongo ' + config.database);
        process.exit(1);
    } else {
        server.listen(port, function() {
            console.log('Node server API listening on port ' + port);
        });        
    }
});