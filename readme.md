# Sigfox Network eligiblity test

[![Greenkeeper badge](https://badges.greenkeeper.io/sigfox/sigfox-network-test.svg)](https://greenkeeper.io/)

This small javascript tool will take addresses, geocode them with Google API, and query Sigfox API in order to test the Sigfox network available over there.

## Install

	git clone https://github.com/sigfox/sigfox-network-test
	npm install

You must add your own Google API Key and Sigfox API Key !!
Add a config.local.js file with :

	module.exports = {
	    GoogleApiKey : '',
	    sigfoxCredentials : {
	        'Login': "",
	        'Password': ""
	    }
	}

## Run

**Usage 1** : node network-test.js "address 1" "address 2" ...

Returns "ID";"address";"Lat";"Lng";"[Noise margin of the 3 best Sigfox BS]"

Example :

	> node network-test.js '3 rue de Londres 75009 Paris'
	1;3 rue de Londres 75009 Paris France;48.8765789;2.3306177; [ 49, 43, 40 ]

**Usage 2** : node network-test.js -f filename.csv'

CSV file should have a header line with ID, address, lat, lng (example provided)

The file can provide for each line EITHER address or lat,lng. 

If both are provided only lat,lng will be used

Returns "ID";"address";"Lat";"Lng";"[Noise margin of the 3 best Sigfox BS]"

Example : 

	> node network-test.js -f example.csv
	2;;48.8584442;2.2933859; [ 58, 52, 51 ]
	1;9 rue de londres 75009 Paris  ;48.87675520000001;2.3299307; [ 49, 43, 40 ]

## Results

The Sigfox availability is returned as an array of 3 integers giving the noise margin in db for the three best basestations of the network. If any value of the array is 0, it means that there is less than 3 BS available here.
