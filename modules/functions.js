const messages = require('./messages');


exports.for_me = (sender, values) => {
  let tekst = 'Hajde da zajedno otkrijemo da li spadate u rizičnu grupu, odnosno da li treba da radite prenatalni Verified test.\n Koliko imate godina? ';

  messages.sendChoiceMessageVerified(sender,tekst,"MANJE OD 35","VIŠE OD 35", "manje", "vise");
};

exports.ne_hvala = (senderID, values) => {
  messages.sendTextMessage(senderID, 'Prijatno');
};
