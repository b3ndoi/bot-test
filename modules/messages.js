const sendAPI = require('./handlers');


exports.sendTextMessage = function (recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      "text": messageText
    }
  };

  sendAPI(messageData);
}
exports.sendOptionMessage = function (recipientId, messageText, broj) {
  console.log(messageText);
  console.log(broj);
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
            "payload": broj+"savet"

          },{
            "type":"postback",
            "title":"ŠTA JOŠ MOŽETE DA OČEKUJETE U OVOJ NEDELJI?",
            "payload": broj+"ocekivanja"
          },
        ]
      }
      }
    }
  };

  sendAPI(messageData);
}

exports.sendChoiceMessage = function (recipientId, messageText, yes, no) {
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

  sendAPI(messageData);
}
