const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db');

const router = express.Router();
let nbTokens = 0;
const maxPageSize = 100;

const secret = process.env.APISECRET;

router.post('/token', (req, res) => {
    if(req.body.password == secret){
        var token = jwt.sign({"user": "user" + nbTokens++}, secret, {
            expiresIn: 60 * 60 * 24
        });
        res.status(200).send({"token": token});
    } else {
        res.status(403).send({"success": false, "message": 'Forbidden'});
    }
});

router.use((req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, secret, (err, decoded) => {      
            if (err) {
                return res.status(403).send({ success: false, message: 'Failed to authenticate token.' });    
            } else {
                req.decoded = decoded;    
                next();
            }
        });
    } else {
        return res.status(403).send({ 
            success: false, 
            message: 'No token provided.' 
        });
    }
});
    
router.get('/bands', (req, res) => {
    if(!req.query.genre){
        res.status(500).send({"message":"Pass a genre name as query parameter"});
    } else {
        let genre = req.query.genre.replace("_", ".").toLowerCase();
        let params = {};
        if(req.query.name)
            params.name = new RegExp(["^",".*", req.query.name.replace("_", " "),".*", "$"].join(""), "i");
        if(req.query.country)
            params.country = new RegExp(["^", req.query.country.replace("_", " "), "$"].join(""), "i");
        if(req.query.location)
            params.location = new RegExp(["^", req.query.location.replace("_", " "), "$"].join(""), "i");

        let limit = parseInt(req.query.limit, 10);
        if (isNaN(limit) || limit > maxPageSize) {
            limit = maxPageSize;
        } else if (limit < 1) {
            limit = 1;
        }
        let page = parseInt(req.query.page, 10);
        if (isNaN(page) || page < 1) {
            page = 1;
        }
        
        db.get().collection(genre).find(params).skip((page - 1) * limit).limit(limit).sort({name : 1}).toArray((err, result) => {
            if(!err){
                let resp;
                if(req.query.name){
                    let bestMatch = [];
                    let others = [];
                    let rg = new RegExp(["^",req.query.name.replace("_", " "),".*", "$"].join(""), "i");
                    result.forEach(function(b) {
                        if(b.name.match(rg)){
                            bestMatch.push(b);
                        } else {
                            others.push(b);
                        }
                    });
                    resp = { "data": bestMatch.concat(others)};
                } 
                else {
                    resp = { "data": result};
                }
                res.status(200).send(resp);
            } else {
                res.status(500).send(err);
            }
        });
    }
});

router.get('/countries', (req, res) => {
    if(!req.query.genre){
        res.status(500).send({"message":"Pass a genre name as query parameter"});
    } else {
        let genre = req.query.genre.replace("_", ".").toLowerCase();
        db.get().collection(genre).distinct(
            "country",
            {}, // query object
            (function(err, docs){
                if(err){
                    res.status(500).send(err);
                }
                if(docs){  
                    res.status(200).send(docs.sort());
                }
            })
        );
    }
});

module.exports = router;