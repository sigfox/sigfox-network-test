#Sigfox Network eligiblity test
This small javascript tool will take addresses, geocode them with Google API, and query Sigfox API in order to test the Sigfox network available over there. 

##Install

	git clone https://github.com/sigfox/sigfox-network-test
	npm install

You must add your own Google API Key and Sigfox API Key !! Go and edit the .js file add at the top in here: 

	// API Google KEY ** Mandatory ** 
	var GoogleApiKey = '';
	// API credentials for Sigfox ** Mandatory ** 
	var sigfoxCredentials = {
	    'Login': "", 
	    'Password': ""
	};

##Run

	Usage : node network-test.js "address 1" "address 2" ...'
	Returns "address";"Lat";"Lng";"[Array of noise margin for the 3 best Sigfox BS]"
	Example :
	> node network-test.js '3 rue de Londres 75009 Paris'");
	> 3 rue de Londres 75009 Paris France;48.8765789;2.3306177; [ 49, 43, 40 ]
	
##Results

The Sigfox availability is returned as an array of 3 integers giving the noise margin in db for the three best basestations of the network. If the value is 0, it means that there is less than 3 BS available here. 
