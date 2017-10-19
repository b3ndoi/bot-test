const messages = require('./messages');
const facebook = require('./facebook');
const user = require('./user');

exports.for_me = (sender, values) => {
  let tekst = 'Hajde da zajedno otkrijemo da li spadate u rizičnu grupu, odnosno da li treba da radite prenatalni Verified test.\n Koliko imate godina? ';

  messages.sendChoiceMessageVerified(sender,tekst,"MANJE OD 35","VIŠE OD 35", "manje", "vise");
};

exports.ne_hvala = (senderID, values) => {
  messages.sendTextMessage(senderID, 'Prijatno');
};

exports.zdravo = (senderID, values)=>{
  user.checkUser(senderID, function(senderId, message){
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
      user_info = facebook.getUserInfo(token, senderID, function(data,senderID){
              user.saveUser(senderID, data);
              messages.sendTextMessage(senderID, 'Dobrodošla '+data.first_name+' u Bebac porodicu! Ja sam tvoj Bebac savetnik i tu sam da pomognem tebi i tvojoj bebi. :)');
              setTimeout(function () {
                messages.sendChoiceMessage(senderID,"Da li želiš da pričamo?","Da želim","Ne hvala");
              }, 500);
            });
    }
  });
};
