var express = require('express');
var request = require('request');
var parser = require('body-parser');

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

app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === 'sifra_za_token') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
});

app.post('/webhook', function (req, res) {
  var data = req.body;
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
                saveUser(sender, data);
                return callback(data, sender);


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
            url: 'http://lsapp.apps-codeit.com/api/facebook/store',
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

function receivedPostback(event){
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;
  console.log(event.postback.payload);
  let payload = event.postback.payload;

  if(payload.substring(2, payload.length) == 'savet'){

    sendOffers(Number(payload.substring(0, 1)), senderID, function(senderID, data){
      console.log(data);
      sendTextMessage(senderID, data.body);
      setTimeout(function () {
        sendOptionMessage(senderID, data);
      }, 500);
    });

  }
  else if(payload.substring(2, payload.length) == 'ocekivanja'){

    sendOffers(Number(payload.substring(0, 1)), senderID, function(senderID, data){
      console.log(data);
      sendTextMessage(senderID, data.tekst);
      setTimeout(function () {
        sendOptionMessage(senderID, data);
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
      if(Number.isInteger(Number(messageText))){

        sendOffers(Number(messageText), senderID, function(senderID, data){
          console.log(data);
          brojevi = false;
          sendTextMessage(senderID, data.title);
          setTimeout(function () {
            sendOptionMessage(senderID, data);
          }, 500);
        });

      }else{
        sendTextMessage(senderID, 'Morate uneti broj');
      }
    }else{

      switch (messageText.toLowerCase()) {
        case 'generic':
          sendGenericMessage(senderID);
          break;
        case 'zdravo':
            user_info = getUserInfo(token, senderID, function(data,senderID){

              sendTextMessage(senderID, 'Dobrodošla '+data.first_name+' u Bebac porodicu! Ja sam tvoj Bebac savetnik i tu sam da pomognem tebi i tvojoj bebi. :)');
              setTimeout(function () {
                sendChoiceMessage(senderID,"Da li želiš da pričamo?","Da želim","Ne hvala");
              }, 500);
            });

          break;
        case 'da želim':{
          user_info = getUserInfo(token, senderID, function(data,senderID){

            sendChoiceMessage(senderID, 'Draga '+data.first_name+', da li si trudna?',"Jesam","Ne nisam");
          });

          break;
        }
        case 'ne hvala':{

          sendTextMessage(senderID, 'Prijatno');
          break;
        }
        case 'jesam':{

          user_info = getUserInfo(token, senderID, function(data,senderID){
            sendTextMessage(senderID, 'Draga '+data.first_name+', čestitam ti! U kojoj si nedelji trudnoće?( npr: 8 )');
            brojevi = true;
          });
          break;
        }
        default:

          sendTextMessage(senderID, 'Napišite "zdravo" da bi ste započeli...');

      }
    }
  } 
  else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}


function sendTyipingMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action:"typing_on"
  };

  callSendAPI(messageData);
}


function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      "text": messageText
    }
  };

  callSendAPI(messageData);
}

function sendOptionMessage(recipientId, messageText) {
  console.log(messageText);
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text":"Šta prvo želite da saznate",
        "buttons":[
          {
            "type":"postback",
            "title":"VAŠA TRUDNOĆA U 8 NEDELJI",
            "payload":"DEVELOPER_DEFINED_PAYLOAD"
          },{
            "type":"postback",
            "title":"SAVET ZA OVU NEDELJU",
            "payload": messageText.id+".savet"
            
          },{
            "type":"postback",
            "title":"ŠTA JOŠ MOŽETE DA OČEKUJETE U OVOJ NEDELJI?",
            "payload":messageText.id+".ocekivanja"
          },
        ]
      }
      }
    }
  };

  callSendAPI(messageData);
}

function sendChoiceMessage(recipientId, messageText, yes, no) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      "text": messageText,
      "quick_replies":[
        {
          "content_type":"text",
          "title":yes,
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED"
        },{
          "content_type":"text",
          "title":no,
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED"
        },
      ]
    }
  };

  callSendAPI(messageData);
}

function sendGenericMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Bebac Web Site",
            subtitle: "Poseti bebac sajt",
            item_url: "https://www.bebac.com/",
            buttons: [{
              type: "web_url",
              url: "https://www.bebac.com/",
              title: "Poseti sajt"
            }],
          }, {
            title: "Bebac Android aplikacija",
            subtitle: "Skini Android Bebac aplikaciju",
            item_url: "https://play.google.com/store/apps/details?id=com.degree361.bebac",
            buttons: [{
              type: "web_url",
              url: "https://play.google.com/store/apps/details?id=com.degree361.bebac",
              title: "Open Web URL"
            }, {
              type: "web_url",
              url: "https://www.bebac.com/",
              title: "Poseti sajt"
            }]
          }, {
            title: "Bebac iOS aplikacija",
            subtitle: "Skini iOS Bebac aplikaciju",
            item_url: "https://itunes.apple.com/us/app/bebac/id815085291?mt=8",
            buttons: [{
              type: "web_url",
              url: "https://itunes.apple.com/us/app/bebac/id815085291?mt=8",
              title: "Open Web URL"
            }, {
              type: "web_url",
              url: "https://www.bebac.com/",
              title: "Poseti sajt"
            }]
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
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
                callback(sender, offers);
            }
        });
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token:  token},
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}

app.listen(port, function () {
    console.log("Server listening on port:"+port);
});
