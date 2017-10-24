var express = require('express');
var request = require('request');
var parser = require('body-parser');

const messages = require('./modules/messages');
const facebook = require('./modules/facebook');
const user = require('./modules/user');
const processor = require('./modules/processor');
const functions = require('./modules/functions');
console.log(messages);
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
    // if(data.quick_reply){
    //   console.log('Naslo');
    // }
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {

        if (event.message) {
          let result = processor.match(event.message.text);
          if (result) {
                let function_find = functions[result.handler];
                if (function_find && typeof function_find === "function") {
                    function_find(event.sender.id, result.match);
                } else {
                    console.log("Handler " + result.handler + " is not defined");
                }
            }
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

function receivedPostback(event){
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;
  console.log(event.postback.payload);
  let payload = event.postback.payload;

  if(payload.substring(13, payload.length) == 'savet'){

    sendOffers(payload.substring(2, 13), senderID, payload.substring(0, 1), function(senderID, data, broj,nedelja_trudnoce){
      console.log(data);
      messages.sendTextMessage(senderID, data.body);
      setTimeout(function () {

        if(nedelja_trudnoce == 8){
          // messages.sendOptionMessage(senderID, data, broj,nedelja_trudnoce);
          messages.sendOptionMessage(senderID, data, broj,nedelja_trudnoce);
          setTimeout(() =>{
            messages.sendChoiceMessageVerified(senderID,"Verified test","DA LI JE TEST ZA MENE","SAZNAJ VIŠE", "for_me", "about");}, 1500);
        }else{
          messages.sendOptionMessage(senderID, data, broj,nedelja_trudnoce);
        }
      }, 500);
    });

  }
  else if(payload.substring(13, payload.length) == 'ocekivanja'){

    sendOffers(payload.substring(2, 13), senderID, payload.substring(0, 1), function(senderID, data, broj,nedelja_trudnoce){
      console.log(data);
      messages.sendTextMessage(senderID, data.tekst);
      setTimeout(function () {
        messages.sendOptionMessage(senderID, data, broj,nedelja_trudnoce);
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
  if(message.quick_reply){
    if(message.quick_reply.payload == 'for_me'){

      const tekst = 'Hajde da zajedno otkrijemo da li spadate u rizičnu grupu, odnosno da li treba da radite prenatalni Verified test.\n Koliko imate godina? ';

      messages.sendChoiceMessageVerified(senderID,tekst,"MANJE OD 35","VIŠE OD 35", "manje", "vise");

    }
    if(message.quick_reply.payload == 'manje'){
      const tekst = "Trudnice mlađe od 35 godina ne spadaju u kategoriju visokog rizika ali svakako postoji mogućnost za hromozomske poremećaje. Kako je rizik kod starijih trudnica veći, one se češće upućuju na testiranja dok se češće kod mlađih trudnica dogodi da ovi poremeđaji ostanu nezapaženi u trudnoći pa je npr veći broj rođene dece sa Daunovim sindromom kod mlađih trudnica. ";
      messages.sendTextMessage(senderID, tekst);
      setTimeout(function () {
        messages.sendChoiceMessageVerified(senderID,"Da li je u porodici bilo genetskih poremećaja?","DA","NE", "da", "ne");
      }, 500);

    }

    if(message.quick_reply.payload == 'vise'){
      const tekst = "Trudnice koje su starije od 35 godina imaju povećan rizik od hromozomskih poremećaja. Da biste bili sigurni u to da je vaša beba hromozomski zdrava uradite Verified prenatalni test.";
      messages.sendTextMessage(senderID, tekst);
      setTimeout(function () {
        messages.sendChoiceMessageVerified(senderID,"Da li je u porodici bilo genetskih poremećaja?","DA","NE", "da", "ne");
      }, 500);

    }

    if(message.quick_reply.payload == 'da'){
      const tekst = "Ukoliko u vašoj porodici postoje hromozomopatije ili ste imali spontani pobačaj, kao i ako ste utvrdili postojanje hromozomopatije u predhodnoj trudnoći, vaša trudnoća je pod visokim rizikom od ovih poremećaja pa se preporučuje VERIFIED test.";
      messages.sendTextMessage(senderID, tekst);
      setTimeout(function () {
        messages.sendChoiceMessageVerified(senderID,"Šta vas najviše brine u trudnoći?","DA","NE", "da", "ne");
      }, 500);
    }

    if(message.quick_reply.payload == 'about'){
      const tekst = "Poudanost  testa je 99,9% , što znači da su lažno pozitivni rezultati izuzetno retki.";
      messages.sendTextMessage(senderID, tekst);
      setTimeout(function () {
        messages.sendChoiceMessageVerified(senderID,"Nastavi?","KAKO SE RADI VERIFIED TEST?","NE", "kako_se_radi", "ne");
      }, 500);
    }

    if(message.quick_reply.payload == 'kako_se_radi'){
      const tekst = "Iz samo jedne epruvete vaše krvi, uz pomoć najsavremenije tehnologije izdvaja se dnk bebe. Nakon što izvadite krv u nekoj od ovlašćenih laboratorija, uzorak se šalje u London gde radi detaljna analiza kroz ceo genom vaše bebe. ";
      messages.sendTextMessage(senderID, tekst);
      setTimeout(function () {
        messages.sendChoiceMessageVerified(senderID,"Nastavi?","KADA SE RADI VERIFIED TEST?","NE", "kada_se_radi", "ne");
      }, 500);
    }

    if(message.quick_reply.payload == 'kad_se_radi'){
      const tekst = "Test možete uraditi od 10. nedelje trudnoće pa do kraja trudnoće ali je važno uraditi ga što pre!";
      messages.sendTextMessage(senderID, tekst);
      setTimeout(function () {
        messages.sendChoiceMessageVerified(senderID,"Nastavi?","GDE MOGU URADITI VERIFIED TEST?","NE", "gde_se_radi", "ne");
      }, 500);
    }

    if(message.quick_reply.payload == 'gde_se_radi'){
      const tekst = "Poručite set za uzimanje uzorka koji će stići na Vašu adresu, a medicinski tim VERIFIED-a pružiće ti i sve dodatne informacije o testu kao i podatak o tome u kojoj najbližoj laboratoriji možeš izvaditi krv. ";
      messages.sendTextMessage(senderID, tekst);
      setTimeout(function () {
        messages.sendChoiceMessageVerified(senderID,"Nastavi?","ŠTA AKO JE REZULTAT TESTA POZITIVAN?","NE", "sta_ako", "ne");
      }, 500);
    }

    if(message.quick_reply.payload == 'sta_ako'){
      const tekst = "Ako rezultat vašeg VERIFIED testa pokaže postojanje neke hromozomopatije, dobićete savete genetičara iz Londona na srpskom jeziku i bićete upućeni na amniocentezu, a troškove dijagnostičkog testa pokriće kompanija CORD Ips koja je zastupnik VERIFIED-a za Srbiju.";
      messages.sendTextMessage(senderID, tekst);
      setTimeout(function () {
        messages.sendChoiceMessageVerified(senderID,"Nastavi?","ZAŠTO ONDA DA NE IDEM ODMAH NA AMNIOCENTEZU?","NE", "zasto_onda", "ne");
      }, 500);
    }

    if(message.quick_reply.payload == 'zasto_onda'){
      const tekst = "Amniocenteza je dijagnostička analiza plodove vode koja je invazivna i nosi rizik od pobačaja. Izlaganje ovom riziku je opravdano ukoliko postoje ozbiljne indikacije, a upravo je VERIFIED test najbolji način da je izbegnete u slučaju da je zaista nepotrebna. ";
      messages.sendTextMessage(senderID, tekst);
      setTimeout(function () {
        messages.sendChoiceMessageVerified(senderID,"Da li želite da poručite Verified test?","ŽELIM","NE ŽELIM", "zelim", "ne");
      }, 500);
    }

    if(message.quick_reply.payload == 'zelim'){
      const tekst = "http://verified.rs/paketi-i-cene/";
      messages.sendTextMessage(senderID, tekst);
      
    }

  }
  if (messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    if(brojevi){


        sendOffers(messageText, senderID, null, function(senderID, data, broj, nedelja_trudnoce){
          console.log(data);

          if(!data.status){
            brojevi = false;
            user.updateUser(senderID, broj);
            messages.sendTextMessage(senderID, data.title);
            setTimeout(function () {
              messages.sendOptionMessage(senderID, data, broj, nedelja_trudnoce);
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
        case 'da želim':{

          user.checkUser(senderID, function(senderId, message){
            if(message.datum_porodjaja){
              user_info = facebook.getUserInfo(token, senderID, function(data,senderID){
                messages.sendTextMessage(senderID, 'Draga '+data.first_name+', sada si u '+message.datum_porodjaja+" nedelji trudnoće.");
                  console.log(message);
                sendOffers(message.datum_porodjaja_da , senderID, message.datum_porodjaja,function(senderID, data, broj, nedelja_trudnoce){
                  console.log(data);

                  if(!data.status){
                    brojevi = false;
                    messages.sendTextMessage(senderID, data.title);
                    setTimeout(function () {
                      messages.sendOptionMessage(senderID, data, broj, nedelja_trudnoce);
                    }, 500);
                  }else{
                    messages.sendTextMessage(senderID, data.message);
                  }
                });

              });
            }else{
              user_info = facebook.getUserInfo(token, senderID, function(data,senderID){
                messages.sendChoiceMessage(senderID, 'Draga '+data.first_name+', da li si trudna?',"Jesam","Ne nisam");
              });
            }
          });
          break;
        }
        case 'jesam':{

          user_info = facebook.getUserInfo(token, senderID, function(data,senderID){
            messages.sendTextMessage(senderID, 'Čestitamo '+data.first_name+' :)Želimo vam lepu i bezbrižnu trudnoću! Kad očekujete bebu? Upiši verovatni termin porođaja: DD.MM.GGGG.');
            brojevi = true;
          });
          break;
        }
        default:
          if(!message.quick_reply){
          messages.sendTextMessage(senderID, 'Napišite "zdravo" da bi ste započeli...');}

      }
    }
  }
  else if (messageAttachments) {
    messages.sendTextMessage(senderID, "Message with attachment received");
  }
}


function sendOffers(broj, sender, nedelja_trudnoce, callback) {
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
                callback(sender, offers, broj, offers.id);
            }
        });
}

app.listen(port, function () {
    console.log("Server listening on port:"+port);
});
