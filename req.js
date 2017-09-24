const request = require('request');
const cheerio = require('cheerio');

let displayStart = 0;
let displayLength = 200;
let totalRecords = -1;

const buildUrl = (query, displayStart, displayLength) => {
    return "https://www.metal-archives.com/search/ajax-band-search/?field=genre&query="+query+"&sEcho=1&iColumns=3&sColumns=&iDisplayStart="+displayStart+"&iDisplayLength="+displayLength+"&mDataProp_0=0&mDataProp_1=1&mDataProp_2=2";    
}

const startRequestBand = (query) => {
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
            const $ = cheerio.load(response.body);
            let tab = $('#band_stats').find("dd");
            /*band.location = tab[1].text.trim();
            band.active = tab[2].text.trim();
            band.formedInYear = tab[3].text.trim();
            band.lyricsTheme = tab[5].text.trim();
            band.label = tab[6].text.trim();
            band.yearActive = tab[7].text.trim();*/
            console.log(tab.text());
        }
    });
}

module.exports.startRequestBand = startRequestBand;