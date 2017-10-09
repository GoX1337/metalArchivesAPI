var redis = require("redis"),
redisClient = redis.createClient();

redisClient.on("error", function (err) {
    console.log("Error " + err);
});

exports.get = function(req, callback) {
    redisClient.get(req, function(err, reply) {
        if(!err){
            callback(reply);
        }
    });
}

exports.saveInCache = function(req, resp) {
    resp.cachedExpirationDate = new Date();
    redisClient.set(req, JSON.stringify(resp), redis.print); 
}