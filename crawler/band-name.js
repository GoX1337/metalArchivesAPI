const request = require('request');
const cheerio = require('cheerio');
const db = require('../db');
const config = require('../config');

let displayStart = 0;
let displayLength = 200;
let totalRecords = -1;
let delay = 0;

const buildUrl = (displayStart) => {
    return "https://www.metal-archives.com/search/ajax-advanced/searching/bands/?bandName=&genre=&country=&yearCreationFrom=&yearCreationTo=&bandNotes=&status=3&themes=&location=&bandLabelName=&sEcho=2&iColumns=3&sColumns=&iDisplayStart=" + displayStart + "&iDisplayLength=200&mDataProp_0=0&mDataProp_1=1&mDataProp_2=2&_=1523212280268";
}

db.connect(config.database, (err) => {
    if(err) {
        console.log('Unable to connect to Mongo ' + config.database);
        process.exit(1);
    } else {
        let url = buildUrl(displayStart);

        request.get(url, (error, response, body) => {
            if(error){
                console.log("error", JSON.stringify(error));
            } else {
                console.log("GET " + url);
                let resp = JSON.parse(response.body);
                parseHTML(resp);
                totalRecords = resp.iTotalRecords;

                for(let i = displayLength; i <= totalRecords; i += displayLength){
                    delay += 200000;
                    setTimeout(()=>{requestBands(buildUrl(i))}, delay);
                }
            }
        });
    }
});

const requestBands = (url) => {
    request.get(url, (error, response, body) => {
        if(error){
            console.log("error requestBands", JSON.stringify(error));
        } else {
            console.log("GET " + url);
            parseHTML(response.body);
        }
    });
}

const parseHTML = (resp) => {
    resp.aaData.forEach((b) => {
        let n = parseName(b[0]);
        console.log(n.name);
    });
}

const parseName = (url) => {
    let n = {};
    if(url){
        let groups = url.match("<a href=\"(.*)\">(.*)</a>");
        n.url  = groups[1];
        n.name = groups[2];
    }
    return n;
 }