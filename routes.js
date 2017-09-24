const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const config = require('./config');
const db = require('./db');

const router = express.Router();
let nbTokens = 0;

router.post('/token', (req, res) => {
    if(req.body.password == "topkek"){
        var token = jwt.sign({"user": "user" + nbTokens++}, config.secret, {
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
        jwt.verify(token, config.secret, (err, decoded) => {      
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });    
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
    db.get().collection('death.metal').find({}).toArray((err, result) => {
        if(!err){
           res.status(200).send(result);
       } else {
           res.status(500).send(err);
       }
   });
});

module.exports = router;