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
                return callback(data);


            }
        });
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
    switch (messageText.toLowerCase()) {
      case 'generic':
        sendGenericMessage(senderID);
        break;
      case 'zdravo':
          getUserInfo(token, senderID, function(data){
            console.log(data);
            user_info = data;

          });
          console.log(user_info);
          sendTextMessage(senderID, 'Dobrodošla u Bebac porodicu! Ja sam tvoj Bebac savetnik i tu sam da pomognem tebi i tvojoj bebi. :)');

        setTimeout(function () {
          sendTyipingMessage(senderID);
          sendChoiceMessage(senderID,"Da li želiš da pričamo?","Da želim","Ne hvala");
        }, 500);
        break;
      case 'da želim':{

        sendChoiceMessage(senderID, 'Da li si trudna {{user_first_name}}?',"Jesam.","Ne nisam.");
        break;
      }
      case 'ne hvala':{

        sendTextMessage(senderID, 'Prijatno');
        break;
      }
      default:

        sendTextMessage(senderID, 'Napišite "zdravo" da bi ste započeli...');
    }
  } else if (messageAttachments) {
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
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",
            image_url: "https://external.fbeg3-1.fna.fbcdn.net/safe_image.php?d=AQDzuFu3YHMhHT0_&url=https%3A%2F%2Fscontent.oculuscdn.com%2Fv%2Ft64.5771-25%2F12727726_260257514396959_4582648530518147072_n.jpg%3Foh%3D79be5f12fbc23c52a45103f03e789909%26oe%3D59FDB74A&_nc_hash=AQCXDicPloAPSgy2",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
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
