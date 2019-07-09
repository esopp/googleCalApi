
const {google} = require('googleapis');


function GoogleCalendarApi () {
    this.initialized = false;
    this.oauth2Client = null;
    this.url = null;
    this.token = null;
    this.calendar = null;

    /**
    * Pass credentials to the GoogleCalendarApi module
    * @param {object} credentials Object with the properties:
    * 	{string} clientId, {string} clientSecret, 
    *   {string} token (optional), and {function} storeToken (optional)
    * @param {string} redirect_url Full callback url for authentication 
    * @param {function} done Callback function, handles either the message 
    * 	"authenticated" (if refresh token was supplied), "initialized" (if 
    *   user still needs to login through oauth to get a token), or an error message.
    **/
    this.init = function (credentials, redirect_url, done) {
	 this.oauth2Client = new google.auth.OAuth2(
		credentials.clientId,
		credentials.clientSecret, 
		redirect_url
	 );
		this.scopes = ['https://www.googleapis.com/auth/calendar'];
		this.url = this.oauth2Client.generateAuthUrl({
			  access_type: 'offline',
			  scope: this.scopes
		})
		if (credentials.token) {
			try {
				this.oauth2Client.setCredentials({
				  refresh_token: credentials.token
			    });
			} catch (err) {
				return done(err)
			}
			return done('authenticated')
		}
		//listeners
		this.oauth2Client.on('tokens', (tokens) => {
			console.log('token event:', this.token)
		  if (tokens.refresh_token) {
		  	if (credentials.storeToken) credentials.storeToken(tokens.refresh_token);
		    this.token = tokens.refresh_token;
		    console.log('refresh: ' + tokens.refresh_token)
		  }
		  console.log('auth token: ' + tokens.access_token)
		})
		console.log('initialized', this.oauth2Client)
		this.initialized = true;
		done('initialized');
	};
	/**
	* @param done: callback function that can handle two params: error and url
	* 			   -error should be null, or an error message
	*			   -url should be an address for Google Cloud's authentication process
	**/
	this.getAuthUrl = (done) => { this.url ? done(null, this.url) : done('error: url not defined') }
	this.storeCred = function (code, done) { //code from req.query.code
		async function cred (auth) {
			try {
			console.log('storeCred ping')
			  const {tokens} = await auth.getToken(code)
			  auth.setCredentials(tokens)
			  console.log('tokens', tokens)
			  done(null, 'authenticated')
			  } catch (err) {
			  	console.log('error in cred:', err)
				      done(err)
			  }
		}
		try { cred(this.oauth2Client) } catch (err) { done(err) }
		
	}
	this.addEvent = function (event, done) {
		console.log('add event ping')
		if (this.calendar === null) this.calendar = google.calendar({version: 'v3', auth: this.oauth2Client});
		try {
		    this.calendar.events.insert({
				auth: this.oauth2Client,
				calendarId: 'primary',
				resource: event
		    }, (err, data) => { done(null, data) })
		} catch (err) {
			done(err)
		}
	}
	this.deleteEvent = function (id, done) {
		console.log('ping deleteEvent')
		if (this.calendar === null) this.calendar = google.calendar({version: 'v3', auth: this.oauth2Client});
		try {
			this.calendar.events.delete({
				auth: this.oauth2Client, 
				calendarId: 'primary',
				eventId: id, 
				sendUpdates: 'none'
			}, (err, data) => err ? done(err) : done(data))
		} catch (err) {
			done(err)
		}
	}
	this.listEvents = function (options, done) {
		console.log('list events ping')
		console.log('auth value:', this.oauth2Client)
			if (this.calendar === null) this.calendar = google.calendar({version: 'v3', auth: this.oauth2Client});
			try {	
			    this.calendar.events.list({
			    calendarId: 'primary',
			    timeMin: (new Date()).toISOString(),
			    maxResults: 10,
			    singleEvents: true,
			    orderBy: 'startTime',
			  }, (err, res) => {
			  	console.log("err", err, "res:",  res)
			    if (err) return done(err)
			    const events = res.data.items;
			    if (events.length) {
			      console.log('Upcoming 10 events:');
			      events.map((event, i) => {
			        const start = event.start.dateTime || event.start.date;
			        console.log(`${start} - ${event.summary}`);
				    console.log(event)
				    done(null, events);
			      });
			    } else {
			      console.log('No upcoming events found.');
			      done(null, 'no events found')
			    }
			  }) } catch (err) {
			    done(err)
			}
    }

	
} //end constructor

module.exports = GoogleCalendarApi;
