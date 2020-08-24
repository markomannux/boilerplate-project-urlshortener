'use strict';

require('dotenv').config();

var dns = require('dns');
var url = require('url');
var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bodyParser = require('body-parser');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.DB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
app.use(bodyParser.urlencoded({extended: 'false'}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

const shortUrlSchema = new Schema({
  original_url: {
    type: String,
    match: /(((http(s)?:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
  }
})

const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);

// your first API endpoint... 
app.post("/api/shorturl/new", (req, res) => {
  const originalUrl = req.body.url

  const shortUrl = new ShortUrl({original_url: originalUrl})
  shortUrl.save((err, data) => {
    if (err) {
      console.log(err);
      res.json({"error":"invalid URL"});
      return;
    }

    dns.lookup(url.parse(originalUrl).hostname, (err) => {
      if (err) {
        console.log(err);
        res.json({"error":"invalid URL"});
        return;
      }
      res.json({"original_url": shortUrl.original_url,"short_url":shortUrl._id});
  
    })

  })


});

app.get('/api/shorturl/:id', (req, res) => {
  ShortUrl.findById(req.params.id, (err, shortUrl) => {
    res.redirect(shortUrl.original_url);
  })
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});