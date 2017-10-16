var express = require('express');
var request = require('request');
var parser = require('body-parser');

const sendAPI = require('./modules/handlers');
const messages = require('./modules/messages');
const facebook = require('./modules/facebook');

var app = express();
var port = process.env.PORT || 8080;
app.use(parser.json());
app.get('/', function (req, res) {
    res.send('Hello from Facebook Messenger Bot');
    // console.log(req);
});
var token = "EAATPaqX2Nd0BAPbtN7wjZCfJyfo9LCbsqbAbnb3TvFJZAoY43xDY9LE95t4JSFwLvOZBO85EusDhqnsjoUHXrr4mBBrr4omT03e7a8vIDMyyzOWPt1zGaTtrNWiX0l0VZCkFTMYjxMBv9yhiDhLKLiKPAqIMOGNQEmNVI6lZCbwZDZD";
var user_info;

var brojevi = false;
var novi_korisnik = true;
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === 'sifra_za_token') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
});

app.post('/webhook', function (req, res) {
  var data = req.body;
  console.log(data);
  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        }else if(event.postback){
          receivedPostback(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

app.post('/bot', function (req, res) {
  var data = req.body;
  console.log(data);
  sendTextMessage(data.senderID, data.message);
  // Make sure this is a page subscription
    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
});


function getUserInfo(token, sender, callback) {

        request({
            url: 'https://graph.facebook.com/v2.6/' + sender,
            qs: {
                fields: 'first_name,last_name,profile_pic,timezone,locale,gender',
                access_token: token
            },
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                console.log('Error getting user data: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                var data = JSON.parse(body);
                console.log(data);

                return callback(data, sender);


            }
        });
    }

function updateUser(sender, data){

      var userData = {
                datum_porodjaja: data,
      };
      request({
                url: 'http://lsapp.apps-codeit.com/api/facebook/'+sender,
                method: 'PUT',
                json: userData
            }, function (error, response, body) {
                if (error) {
                    console.log('Error sending message: ', error);
                } else if (response.body.error) {
                    console.log('Error: ', response.body.error);
                }
            });
    }

function saveUser(sender, data){
  var timezone = data.timezone > 0 ?
            '+' + data.timezone : data.timezone;
  var userData = {
            id: sender,
            gender: data.gender,
            first_name: data.first_name,
            last_name: data.last_name,
            profile_pic: data.profile_pic,
            timezone: 'GMT ' + timezone + 'h',
            locale: data.locale
  };
  request({
            url: 'http://lsapp.apps-codeit.com/api/facebook',
            method: 'POST',
            json: userData
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
}

function checkUser(sender, callback) {
        request({
            url: 'http://lsapp.apps-codeit.com/api/facebook/' + sender,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                console.log('Error getting user data: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                var message = JSON.parse(body);
                console.log(message);
                callback(sender, message);
            }
        });
}

function receivedPostback(event){
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;
  console.log(event.postback.payload);
  let payload = event.postback.payload;

  if(payload.substring(11, payload.length) == 'savet'){

    sendOffers(payload.substring(0, 11), senderID, function(senderID, data, broj){
      console.log(data);
      messages.sendTextMessage(senderID, data.body);
      setTimeout(function () {
        messages.sendOptionMessage(senderID, data, broj);
      }, 500);
    });

  }
  else if(payload.substring(11, payload.length) == 'ocekivanja'){

    sendOffers(payload.substring(0, 11), senderID, function(senderID, data, broj){
      console.log(data);
      messages.sendTextMessage(senderID, data.tekst);
      setTimeout(function () {
        messages.sendOptionMessage(senderID, data, broj);
      }, 500);
    });
  }

}

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  // console.log("Received message for user %d and page %d at %d with message:",
    // senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;

  var messageAttachments = message.attachments;

  if (messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    if(brojevi){


        sendOffers(messageText, senderID, function(senderID, data, broj){
          console.log(data);

          if(!data.status){
            brojevi = false;
            updateUser(senderID, broj);
            messages.sendTextMessage(senderID, data.title);
            setTimeout(function () {
              messages.sendOptionMessage(senderID, data, broj);
            }, 500);
          }else{
            messages.sendTextMessage(senderID, data.message);
          }
        });
    }else{
      // checkUser(senderID, function(senderId, message){
      //   if(message.message){
      //     console.log('nalog vec postoji');
      //     novi_korisnik = false;
      //   }else{
      //     console.log('novi nalog');
      //   }
      // });
      switch (messageText.toLowerCase()) {
        case 'generic':
          messages.sendGenericMessage(senderID);
          break;
        case 'zdravo':
              checkUser(senderID, function(senderId, message){
                if(message.message == 'true'){
                  console.log('nalog vec postoji');
                  user_info = facebook.getUserInfo(token, senderID, function(data,senderID){

                          messages.sendTextMessage(senderID, 'Znamo se '+data.first_name+' :)');
                          setTimeout(function () {
                            messages.sendChoiceMessage(senderID,"Da li želiš da pričamo?","Da želim","Ne hvala");
                          }, 500);
                        });
                  novi_korisnik = false;
                }else{
                  console.log('novi nalog');
                  user_info = getUserInfo(token, senderID, function(data,senderID){
                          saveUser(senderID, data);
                          messages.sendTextMessage(senderID, 'Dobrodošla '+data.first_name+' u Bebac porodicu! Ja sam tvoj Bebac savetnik i tu sam da pomognem tebi i tvojoj bebi. :)');
                          setTimeout(function () {
                            messages.sendChoiceMessage(senderID,"Da li želiš da pričamo?","Da želim","Ne hvala");
                          }, 500);
                        });
                }
              });


          break;
        case 'da želim':{

          checkUser(senderID, function(senderId, message){
            if(message.datum_porodjaja){
              user_info = getUserInfo(token, senderID, function(data,senderID){
                messages.sendTextMessage(senderID, 'Draga '+data.first_name+', sada si u '+message.datum_porodjaja+" nedelji trudnoće.");
                  console.log(message);
                sendOffers(message.datum_porodjaja_da , senderID, function(senderID, data, broj){
                  console.log(data);

                  if(!data.status){
                    brojevi = false;
                    messages.sendTextMessage(senderID, data.title);
                    setTimeout(function () {
                      messages.sendOptionMessage(senderID, data, broj);
                    }, 500);
                  }else{
                    messages.sendTextMessage(senderID, data.message);
                  }
                });

              });
            }else{
              user_info = getUserInfo(token, senderID, function(data,senderID){
                messages.sendChoiceMessage(senderID, 'Draga '+data.first_name+', da li si trudna?',"Jesam","Ne nisam");
              });
            }
          });
          break;
        }
        case 'ne hvala':{

          messages.sendTextMessage(senderID, 'Prijatno');
          break;
        }
        case 'jesam':{

          user_info = getUserInfo(token, senderID, function(data,senderID){
            messages.sendTextMessage(senderID, 'Draga '+data.first_name+', čestitam ti! U kojoj si nedelji trudnoće?( npr: 8 )');
            brojevi = true;
          });
          break;
        }
        default:

          messages.sendTextMessage(senderID, 'Napišite "zdravo" da bi ste započeli...');

      }
    }
  }
  else if (messageAttachments) {
    messages.sendTextMessage(senderID, "Message with attachment received");
  }
}


function sendOffers(broj, sender, callback) {
        request({
            url: 'http://lsapp.apps-codeit.com/api/posts/' + broj,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                console.log('Error getting user data: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                var offers = JSON.parse(body);
                callback(sender, offers, broj);
            }
        });
}

app.listen(port, function () {
    console.log("Server listening on port:"+port);
});
