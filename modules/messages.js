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
exports.sendOptionMessage = function (recipientId, messageText, broj, nedelja_trudnoce) {
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
            "title":"VAŠA TRUDNOĆA U "+ nedelja_trudnoce +" NEDELJI",
            "payload":"DEVELOPER_DEFINED_PAYLOAD"
          },{
            "type":"postback",
            "title":"SAVET ZA OVU NEDELJU",
            "payload": nedelja_trudnoce+"."+broj+"savet"

          },{
            "type":"postback",
            "title":"ŠTA JOŠ MOŽETE DA OČEKUJETE U OVOJ NEDELJI?",
            "payload": nedelja_trudnoce+"."+broj+"ocekivanja"
          },
        ]
      }
      }
    }
  };

  sendAPI(messageData);
}

exports.sendGenericMessage = function(recipientId, messageText) {
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
        }
      ]
    }
  };

  sendAPI(messageData);
}

exports.sendChoiceMessageVerified = function (recipientId, messageText, yes, no, payload_yes, payload_no) {
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
          "payload":payload_yes
        },{
          "content_type":"text",
          "title":no,
          "payload":payload_no
        }
      ]
    }
  };

  sendAPI(messageData);
}
