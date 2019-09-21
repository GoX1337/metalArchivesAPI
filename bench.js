var request = require('request');
var apiBenchmark = require('api-benchmark');
var fs = require('fs');

var service = {
    server1: 'http://localhost:1337/api/v1/'
};

let options = {
    method: 'POST',
    uri: service.server1 + "auth/token",
    body: {
        username: process.env.USERNAME,
        password: process.env.PASSWORD
    },
    json: true
};

request.post(options, (err, res, body) => {
    if (err) {
        return console.log(err);
    }
    let token = body.token;
    if (!token) {
        return console.error("no token");
    }
    var routes = {
        route1: 'bands?token=' + token
    };

    apiBenchmark.measure(service, routes, {
        debug: false,
        runMode: 'parallel',
        maxConcurrentRequests: 10,
        delay: 0,
        maxTime: 100000,
        minSamples: 100,
        stopOnError: false
    }, (err, results) => {
        apiBenchmark.getHtml(results, (error, html) => {
            fs.writeFileSync('benchmarks.html', html);
        });
    });
});
