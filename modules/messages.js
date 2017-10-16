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
