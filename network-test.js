// API Google KEY ** Mandatory ** 
var GoogleApiKey = '';
// API credentials for Sigfox ** Mandatory ** 
var sigfoxCredentials = {
    'Login': "", 
    'Password': ""
};

var request = require('request')
var googleMapsClient = require('@google/maps').createClient({
  key: GoogleApiKey
});


if (typeof(GoogleApiKey) == 'undefined' || !GoogleApiKey){
    console.log("! ERROR : Please edit the geocode.js file and add your Google API Key");
}
else {
    if (typeof(sigfoxCredentials) == 'undefined' || !sigfoxCredentials.Login || !sigfoxCredentials.Password) {
        console.log("! ERROR : Please edit the geocode.js file and add your Sigfox API Key"); 
    }
    else {
        // Control the number of command line arugments 
        if (process.argv.length < 3 ){
            console.log('Usage : node geocode.js "address 1" "address 2" ...');
            console.log('Returns "address";"Lat";"Lng";"[Array of noise margin for the 3 best Sigfox BS]"');
            console.log("Example : ");
            console.log("> node geocode.js '3 rue de Londres 75009 Paris'");
            console.log("> 3 rue de Londres 75009 Paris France;48.8765789;2.3306177; [ 49, 43, 40 ]");
        }
        else {// print process.argv
            process.argv.forEach(function (val, index, array) {
                // Process only the addresses passed
                if (index > 1){
                // Geocode an address.
                googleMapsClient.geocode({
                  address: val
                }, function(err, response) {
                    if (!err) {
                        // console.log(response.json.results);
                        var options = {
                            url: 'http://backend.sigfox.com/api/coverages/global/predictions?lat='+response.json.results[0].geometry.location.lat + '&lng=' + response.json.results[0].geometry.location.lng,
                            auth: {
                                user: sigfoxCredentials.Login,
                                password: sigfoxCredentials.Password
                            }
                        };
                        request(options, function (err, res, body) {
                            if (err) {
                                console.dir("**Sigfox API error" + err);
                            }
                            else {
                                //console.dir('headers', res.headers);
                                //console.dir('status code', res.statusCode);
                                //console.dir(body);
                                var SigfoxResult = JSON.parse(body); 
                                console.log(val + ';' + response.json.results[0].geometry.location.lat + ";" + response.json.results[0].geometry.location.lng + ';', SigfoxResult.margins);
                            }
                        })
                  }else {
                    console.log("**Google Geocoding Error:" + err);  
                  }
                });
              }
            });
        }
    }
}