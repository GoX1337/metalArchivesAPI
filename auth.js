const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
let nbTokens = 0;

const secret = process.env.APISECRET;

router.post('/register', (req, res) => {
    if(req.body.username && req.body.password){

    } else {
        res.status(400).send({"message": "Username and password are missing"});
    }
});

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

module.exports = router;