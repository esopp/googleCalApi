"use strict";
//Google Calendar API module 
//const fs = require('fs');
//const readline = require('readline');
const express = require('express');
const app = express();

//must be initialized with .init()
const CalendarManager = require('./GoogleCalApi.js');
const calendar = new CalendarManager();
require('dotenv').config('./.env');

const sessionEvents =  [];

calendar.init(process.env.GOOGLE_CLIENT_ID, 
	process.env.GOOGLE_CLIENT_SECRET, 
	process.env.REDIRECT_URL + '/oauthcallback', 
	(m) => console.log);

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/test.html')
})

app.get('/verify', (req, res) => {
  calendar.getAuthUrl((err, url)=>{ err ? res.send('error getting auth url') : 
  	res.redirect(url) });
})

app.get('/oauthcallback', (req, res) => {
	console.log('callback ping')
 let done = (err, message) => message ? res.send(message) : res.send(err);
 calendar.storeCred(req.query.code, done)
})

app.get('/list', (req, res) => {
	console.log('list  route ping')
	console.log('req', req)
	console.log('res', res)
	calendar.listEvents({}, (err, data) => { res.send(err ? err : data)});
})
app.get('/add', (req, res) => {
	console.log('add  route ping')
	let event = {
	    'summary': 'Chloe NONBirthday',
	    'start': {
	      'date': '2019-07-13'
	    },
	    'end': {
	      'date': '2019-07-14'
	    }
    }
	calendar.addEvent(event, (err, data) => { 
		if (data.data.id) sessionEvents.push(data.data.id)
		console.log(sessionEvents)
		res.send(err ? err : data.data) 
	});
})
app.get('/delete', (req, res) => {
   if (sessionEvents.length > 0) calendar.deleteEvent(sessionEvents.shift(), (err, data) => {
   	res.send(err ? err : data) 
   })
   	else res.send('no events in local memory')
})

app.listen(3000, () => {console.log('listening on port 3000')})