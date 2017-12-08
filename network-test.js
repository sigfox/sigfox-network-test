"use strict;"
// The script needs a local.config.js file
// Example :
/*
module.exports = {
    GoogleApiKey : '',
    sigfoxCredentials : {
        'Login': "",
        'Password': ""
    }
}
*/

// INCLUDES
var api = require('./local.config.js')
var request = require('request')
var googleMapsClient = require('@google/maps').createClient({
  key: api.GoogleApiKey
});
var fs = require('fs');
var parse = require('csv-parse');

function geocodeAndCoverageCheck(ID, address, lat, lng){
  // ID is simply here to be able to reorder the results after async responses
  // Function will call Google API to geocode an address, if necessary
  // And then call the SigfoxCoverage Check.
  // Geocode an address.
  if (typeof(lat) == 'undefined' || typeof(lng) == 'undefined'){
    // If the lat,lng is not provided, first we need to Geocode with Google
    googleMapsClient.geocode({
      address: address
    }, function(err, response) {
        if (err) {
          console.dir("ID:" + ID + "**Google API error" + err);
          return false;
        }
        else {
            // console.log(response.json.results);
            coverageCheck(address, response.json.results[0].geometry.location.lat, response.json.results[0].geometry.location.lng, function(addressCB, latCB, lngCB, coverageResultsCB){
              console.log(ID + ";" + addressCB + ';' + latCB + ";" + lngCB + ';', coverageResultsCB);
              return true;
            });
        }
    });
  } else {
    // if lat,lng is provided just do the coverage check with Sigfox API
    coverageCheck(address, lat, lng, function(addressCB, latCB, lngCB, coverageResultsCB){
      console.log(ID + ";" + addressCB + ';' + latCB + ";" + lngCB + ';', coverageResultsCB);
      return true;
    });
  }
}

function coverageCheck(address, lat, lng, callbackFunction){
  // Sigfox API request
  // callbackFunction has 4 arguments: address, lat, lng, coverageResults
  var options = {
      url: 'http://backend.sigfox.com/api/coverages/global/predictions?lat='+lat + '&lng=' + lng,
      auth: {
          user: api.sigfoxCredentials.Login,
          password: api.sigfoxCredentials.Password
      }
  };
  request(options, function (err, res, body) {
      if (err) {
          console.dir("ID:" + ID + "**Sigfox API error" + err);
          return false;
      }
      else {
          //console.dir('headers', res.headers);
          //console.dir('status code', res.statusCode);
          //console.dir(body);
          callbackFunction(address, lat, lng, JSON.parse(body).margins);
          return true;
      }
  })
}

/////////////////////////////////
// MAIN FUNCTION               //
/////////////////////////////////

if (typeof(api.GoogleApiKey) == 'undefined' || !api.GoogleApiKey){
  console.log("! ERROR : Please edit the local.conf.js file and add your Google API Key");
}
else {
  if (typeof(api.sigfoxCredentials) == 'undefined' || !api.sigfoxCredentials.Login || !api.sigfoxCredentials.Password) {
    console.log("! ERROR : Please edit the local.conf.js file and add your Sigfox API Key");
  }
  else {
    // Control the number of command line arugments
    if (process.argv.length < 3 ){
      console.log('Usage 1 : node network-test.js "address 1" "address 2" ...');
      console.log('Returns "ID";"address";"Lat";"Lng";"[Noise margin of the 3 best Sigfox BS]"');
      console.log("Example : ");
      console.log("> node network-test.js '3 rue de Londres 75009 Paris'");
      console.log("> 1;3 rue de Londres 75009 Paris France;48.8765789;2.3306177; [ 49, 43, 40 ]\n");

      console.log('Usage 2 : node network-test.js -f filename.csv');
      console.log('CSV file should be UTF-8 encoded, and use ; as a separator, it should have a header line with ID, address, lat, lng (example provided)');
      console.log('The file can provide for each line EITHER address or lat,lng. If both are provided only lat,lng will be used');
      console.log('Returns "ID";"address";"Lat";"Lng";"[Noise margin of the 3 best Sigfox BS]"\n');
    }
    else if (process.argv.length == 4 & process.argv[2] == '-f') {
      // if we receive input '-f filename'
      var fileName =  process.argv[3];
      fs.createReadStream(fileName)
        .pipe(parse({delimiter: ';',
              columns : ['ID','address','lat','lng'],
              from : 2
          }))
        .on('data', function(csvrow) {
            //console.log(csvrow);
            //do something with csvrow
            if (typeof(csvrow.lat) == 'undefined' || csvrow.lat == ''|| typeof(csvrow.lng) == 'undefined' || csvrow.lng == ''){
              geocodeAndCoverageCheck(csvrow.ID, csvrow.address);
            }
            else {
              coverageCheck(csvrow.address, csvrow.lat, csvrow.lng, function(addressCB, latCB, lngCB, coverageResultsCB){
                console.log(csvrow.ID + ";" + addressCB + ';' + latCB + ";" + lngCB + ';', coverageResultsCB);
              });
            }
            // csvData.push(csvrow);
      })
      /* .on('end',function() {
      });*/
    }
    else {
    // if we receive addresses inline
      process.argv.forEach(function (val, index, array) {
        // Process only the addresses passed (Arguments 0 and 1 are "node" and the script name)
        if (index > 1){
          geocodeAndCoverageCheck(index-1, val);
        }
      });
    }
  }
}
