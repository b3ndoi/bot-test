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
