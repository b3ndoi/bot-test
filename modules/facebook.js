const request = require('request');
const parser = require('body-parser');

// var token = "EAATPaqX2Nd0BAPbtN7wjZCfJyfo9LCbsqbAbnb3TvFJZAoY43xDY9LE95t4JSFwLvOZBO85EusDhqnsjoUHXrr4mBBrr4omT03e7a8vIDMyyzOWPt1zGaTtrNWiX0l0VZCkFTMYjxMBv9yhiDhLKLiKPAqIMOGNQEmNVI6lZCbwZDZD";

exports.getUserInfo = function (token, sender, callback) {

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

                return callback(data, sender);


            }
        });
    }
