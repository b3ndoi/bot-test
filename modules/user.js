const request = require('request');
const parser = require('body-parser');

exports.updateUser = function (sender, data){

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

exports.saveUser = function (sender, data){
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

exports.checkUser = function(sender, callback) {
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
