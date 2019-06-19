GoogleCalApi 

GoogleCalApi.js handles authentication with oAuth and interfacing with google calendars.


#SETUP:

In order to use calendar functions, first initialize calendar object and authenticate:

##Initialize

```javascript
//must be initialized with .init()
const CalendarManager = require('./GoogleCalApi.js');
const calendar = new CalendarManager();

calendar.init(GOOGLE_CLIENT_ID, 
	GOOGLE_CLIENT_SECRET, 
	YOUR_APP_URL + '/oauthcallback', 
	(message) => console.log); //expected log: initialized 
```

##Authenticate
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

