const request = require('request');
const cheerio = require('cheerio');
const db = require('./db');

let displayStart = 0;
let displayLength = 200;
let totalRecords = -1;
let q;

const buildUrl = (query, displayStart, displayLength) => {
    return "https://www.metal-archives.com/search/ajax-band-search/?field=genre&query="+query+"&sEcho=1&iColumns=3&sColumns=&iDisplayStart="+displayStart+"&iDisplayLength="+displayLength+"&mDataProp_0=0&mDataProp_1=1&mDataProp_2=2";    
}

const startRequestBand = (query) => {
    q = query;
    let url = buildUrl(query, displayStart, displayLength);
    request.get(url, (error, response, body) => {
        if(error){
            console.log("error", JSON.stringify(error));
        } else {
            console.log("GET " + url);
            let resp = JSON.parse(response.body);
            totalRecords = resp.iTotalRecords;
            parseResponse(resp);
            for(let i = displayLength; i <= totalRecords; i += displayLength ){
                //requestBands(buildUrl(query, i, displayLength));
            }
        }
    });
}

const requestBands = (url) => {
    request.get(url, (error, response, body) => {
        if(error){
            console.log("error requestBands", JSON.stringify(error));
        } else {
            console.log("GET " + url);
            parseResponse(JSON.parse(response.body));
        }
    });
}

const parseResponse = (resp) => {
    resp.aaData.forEach(function(b) {
        let n = parseName(b[0]);
        let band = {
            "name": n.name,
            "genre": b[1],
            "country": b[2],
            "url": n.url
        };
        getBandDetails(band);
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

const getBandDetails = (band) => {
    request.get(band.url, (error, response, body) => {
        if(error){
            console.log("error getBandDetails", JSON.stringify(error));
        } else {
            console.log("GET " + band.url);
            parseHTML(response.body, band);

            db.get().collection(q.toLowerCase().replace("+", ".")).insertOne(band, (err, result) => {
                if (!err) {
                    console.log("New band inserted in db " + band.name);
                }
            });
        }
    });
}

const parseHTML = (html, band) =>{
    const $ = cheerio.load(html);
    band.location = $('#band_stats').find("dd").eq(1).text();
    band.active = $('#band_stats').find("dd").eq(2).text();
    band.formedIn = $('#band_stats').find("dd").eq(3).text();
    band.lyricsTheme = $('#band_stats').find("dd").eq(5).text();
    band.label = $('#band_stats').find("dd").eq(6).text();
    band.yearActive = $('#band_stats').find("dd").eq(7).text().trim().replace(/\s+/g, " ");
    if($('#logo').attr('href'))
        band.logo = $('#logo').attr('href');
    if($('#photo').attr('href'))    
        band.photo = $('#photo').attr('href');
}

module.exports.startRequestBand = startRequestBand;