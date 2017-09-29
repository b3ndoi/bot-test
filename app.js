var express = require('express');
var request = require('request');
var parser = require('body-parser');

var app = express();
var port = process.env.PORT || 8080;
app.get('/', function (req, res) {
    res.send('Hello from Facebook Messenger Bot');
    // console.log(req);
});

app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === 'YOUR_VERIFY_TOKEN') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
});

app.listen(port, function () {
    console.log("Server listening on port");
});
