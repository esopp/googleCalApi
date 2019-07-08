GoogleCalApi 

Require GoogleCalApi.js to handle authentication with oAuth and interface with Google Calendar's API.
The test.js and test.html files in this repo are sample uses

Credentials
-------

Set up a Google Calendar API key and secret by following Step 1, "Turn On the Google Calendar API," at https://developers.google.com/calendar/quickstart/nodejs to recieve credentials. 


SETUP:
========

In order to use calendar functions, first initialize calendar object and authenticate:

Initialize
--------

```javascript
//must be initialized with .init()
const CalendarManager = require('./GoogleCalApi.js');
const calendar = new CalendarManager();

calendar.init({
	clientId: GOOGLE_CLIENT_ID, 
	clientSecret: GOOGLE_CLIENT_SECRET, 
	token: STORED_USER_SPECIFIC_REFRESH_TOKEN [optional if clientId and clientSecret are supplied],
	storeToken: FUNCTION_TO_STORE_REFRESH_TOKEN [optional]
	},
	YOUR_APP_URL + '/oauthcallback', 
	(message) => console.log); //expected log: initialized 
```

Authenticate
---------
```javascript

app.get('/verify', (req, res) => {
  //get an authentication url and visit that url
  calendar.getAuthUrl((error, url)=>{ error ? res.send('error getting auth url') : 
  	res.redirect(url) });
})

/**
* Google's Auth process should redirect to [YOUR APP URL] + '/oauthcallback'  
* after the user logs in at the url retrieved with calendar.getAuthUrl
**/
app.get('/oauthcallback', (req, res) => {
 //callback function
 let done = (err, message) => {
 	.....
 	//error should be null
 	//expect message to be 'authenticated'
 };
 
 calendar.storeCred(req.query.code, done)
})
```

