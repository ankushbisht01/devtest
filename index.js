/* eslint-env node */

require('dotenv').config()

// ----- Initialize Express -----

var express = require('express')
var app = express()

// ----- Configuration -----

var port = process.env.PORT || 3000
var host = process.env.HOST || '127.0.0.1'

var dbport = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/website-sparc'
console.log('Using MongoDB URI:', dbport)
var routes = require('./routes.js')

// ----- Middleware -----

//Import the mongoose module
var mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)

//Set up default mongoose connection
mongoose.connect(dbport, { useNewUrlParser: true, useUnifiedTopology: true })
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise
//Get the default connection
var db = mongoose.connection

//Bind connection to error event (to get notification of connection errors)
db.on('error', function(err) {
	console.error('MongoDB connection error:', err.message)
})
db.once('open', function() {
	console.log('Connected to MongoDB')
})

// -----

var bodyParser = require('body-parser')

//To parse URL encoded data
app.use(
	bodyParser.urlencoded({
		extended: false
	})
)

//To parse json data
app.use(bodyParser.json())

// -----

app.set('view engine', 'pug')
app.set('views', './views')

// -----

var cors = require('cors')
app.use(cors())

// -----

var favicon = require('serve-favicon')
app.use(favicon('./www/favicon.ico'))

// -----

app.use(express.static('www'))

// -----

app.use('/', routes)

// -----

app.use(function(req, res) {
	res.status(404)

	// respond with html page
	if (req.accepts('html')) {
		res.render('404', {
			url: req.url
		})
		return
	}

	// respond with json
	if (req.accepts('json')) {
		res.send({
			error: 'Not found'
		})
		return
	}

	// default to plain-text. send()
	res.type('txt').send('Not found')
})

// ----- Start listening -----

var server = app.listen(port, host, function(err) {
	if (err) {
		console.error('Unable to start server:', err.message)
		process.exit(1)
	}
	console.log('App listening at http://' + host + ':' + port)
})

server.on('error', function(err) {
	console.error('Unable to start server:', err.message)
	process.exit(1)
})
