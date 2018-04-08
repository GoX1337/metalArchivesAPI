const req = require('./req');

let band = {
    "name" : "Ritualization",
    "url"  : "https://www.metal-archives.com/bands/Ritualization/121265",
    "country" : "France",
    "genre" : "Blackened Death Metal"
}

req.getBandDetails(band);