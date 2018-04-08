const request = require('request');
const cheerio = require('cheerio');
const db = require('../db');

let displayStart = 0;
let displayLength = 200;
let totalRecords = -1;
let q;
let delay = 0;

var bandcamp = require('bandcamp-scraper');
var params = {
    //query: 'Sacraments to the Sons of the Abyss'
    query: 'Ritualization'
};
bandcamp.search(params, function(error, searchResults) {
 if (error) {
   console.log(error);
 } else {
   console.log(searchResults);
 }
});

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
                delay += 200000;
                setTimeout(()=>{requestBands(buildUrl(query, i, displayLength))}, delay);
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
    let d = 0;
    resp.aaData.forEach((b) => {
        let n = parseName(b[0]);
        let band = {
            "name": n.name,
            "genre": b[1],
            "country": b[2],
            "url": n.url
        };
        d += 1000;
        setTimeout(()=>{getBandDetails(band)}, d);
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

            parseHTML(response.body, band, () => {
                console.log(band);
                if(!q) return;
                db.get().collection(collectionName).insertOne(band, (err, result) => {
                    if (!err) {
                        console.log("New band inserted in db " + band.name);
                    }
                });
            }); 
        }
    });
}

const parseHTML = (html, band, cb) => {
    const $ = cheerio.load(html);
    band.location = $('#band_stats').find("dd").eq(1).text();
    band.active = $('#band_stats').find("dd").eq(2).text();
    band.isActive = (band.active == "Active");
    band.formedIn = $('#band_stats').find("dd").eq(3).text();
    band.lyricsTheme = $('#band_stats').find("dd").eq(5).text();
    band.label = $('#band_stats').find("dd").eq(6).text();
    band.yearActive = $('#band_stats').find("dd").eq(7).text().trim().replace(/\s+/g, " ");
    band.addedDate = $('#auditTrail').find("td").eq(2).text().replace("Added on:", "").trim();
    band.lastUpdateDate = $('#auditTrail').find("td").eq(3).text().replace("Last modified on:", "").trim();
    band.discogaphyUrl = $('#band_disco').find("li").eq(0).find("a").attr('href');
    band.reviewUrl = $('#band_tabs').find("a").eq(2).attr('href');
    band.relatedLinksUrl = $('#band_tabs').find("li").eq(4).find("a").attr('href');

    if($('#band_stats').find("dd").eq(6).find("a").attr('href'))
        band.labelUrl = $('#band_stats').find("dd").eq(6).find("a").attr('href');
    if($('#logo').attr('href'))
        band.logo = $('#logo').attr('href');
    if($('#photo').attr('href'))    
        band.photo = $('#photo').attr('href');

    band.currentMembers = [];
    $('#band_tab_members_current').find('tr[class=lineupRow]').each(function(i, elem) {
        let member = {
            name: $(this).find("td").eq(0).text().trim(),
            url: $(this).find("td").eq(0).find("a").attr('href'),
            role: $(this).find("td").eq(1).text().trim()
        }
        band.currentMembers.push(member);
    });
    band.pastMembers = [];
    $('#band_tab_members_past').find('tr[class=lineupRow]').each(function(i, elem) {
        let member = {
            name: $(this).find("td").eq(0).text().trim(),
            url: $(this).find("td").eq(0).find("a").attr('href'),
            role: $(this).find("td").eq(1).text().trim()
        }
        band.pastMembers.push(member);
    });   

    getOtherUrlsBandInfos(band, cb);
}

const getOtherUrlsBandInfos = (band, cb) => {
    request.get(band.discogaphyUrl, (error, response, body) => {
        if(error){
            console.log("error getOtherUrlsBandInfos discogaphyUrl", JSON.stringify(error));
        } else {
            console.log("GET " + band.discogaphyUrl);
            parseHTMLDisco(band, response.body);
        }

        request.get(band.relatedLinksUrl, (error, response, body) => {
            if(error){
                console.log("error getOtherUrlsBandInfos relatedLinksUrl", JSON.stringify(error));
            } else {
                console.log("GET " + band.relatedLinksUrl);
                parseHTMLLinks(band, response.body);
            }
            cb();
        });
    });
}

const parseHTMLDisco = (band, html) => {
    const $ = cheerio.load(html);
    band.discography = [];
    $('tr').each(function(i, elem) {
        if($(this).find("td").eq(0).text()){
            let item = {
                name: $(this).find("td").eq(0).text().trim(),
                type: $(this).find("td").eq(1).text().trim(),
                year: $(this).find("td").eq(2).text().trim(),
                url : $(this).find("td").eq(0).find("a").attr('href')
            }
            band.discography.push(item);
        }
    });  
}

const parseHTMLLinks = (band, html) => {
    const $ = cheerio.load(html);
    band.relatedLink = {
        official: [],
        unofficial: []
    };
    $('#band_links_Official').find('a').each(function(i, elem) {
        let link = {
            name: $(this).text().trim(),
            url: $(this).attr('href')
        }
        band.relatedLink.official.push(link);
    });  

    $('#band_links_Unofficial').find('a').each(function(i, elem) {
        let link = {
            name: $(this).text().trim(),
            url: $(this).attr('href')
        }
        band.relatedLink.unofficial.push(link);
    });  
}

module.exports = {
    startRequestBand: startRequestBand,
    getBandDetails: getBandDetails
}