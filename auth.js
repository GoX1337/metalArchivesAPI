const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
const log = require('./logger');

const router = express.Router();

router.post('/register', (req, res) => {
    if (!req.body.username || !req.body.password || !req.body.email) {
        res.status(400).send({ "message": "username, password and email are mandatory" });
    } 

    db.get().collection("users").find({username: req.body.username}).toArray((err, result) => {
        if (err) {
            log.error(err);
            res.status(500).send();
        }
        if (result && result.length > 0){
            let msg = "User " + req.body.username + " already exists";
            log.warn(msg + " ", result);
            res.status(200).send({message:msg});
            return;
        }

        let user = {
            username: req.body.username,
            hash: bcrypt.hashSync(req.body.password, 10),
            email: req.body.email,
            creationDate: new Date()
        }

        db.get().collection("users").insertOne(user, (err, result) => {
            if (err) {
                log.error(err);
                res.status(500).send();
            }
            let msg = "User " + req.body.username + " created in db";
            log.info(msg);
            res.status(200).send({message:msg});
        });

    });
});

router.post('/token', (req, res) => {
    db.get().collection("users").findOne({username: req.body.username}, (err, user) => {
        if (err) {
            log.error(err);
            res.status(500).send();
        }
        if (user && bcrypt.compareSync(req.body.password, user.hash)) {
            var token = jwt.sign({ "user": user._id }, process.env.APISECRET, {
                expiresIn: 60 * 60 * 24
            });
            log.info("User " + user.username + " authenticated, token sent");
            res.status(200).send({ "token": token });
        }
        else {
            res.status(403).send({"message": 'Forbidden: wrong username/password' });
        }
    });
});

module.exports = router;