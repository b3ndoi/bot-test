let readline = require('readline'),
    fs = require('fs'),
    fileName = 'dictionary.txt',
    utterances = [];

const rl = readline.createInterface({
    input: fs.createReadStream(fileName)
});

rl.on('line', (line) => {
    var index = line.indexOf(' ');
    if (index>0) {
        var handler = line.substring(0, index);
        var utterance = line.substring(index + 1);
        utterances.push({utterance: utterance, handler:handler});
        console.log(utterances);
    }
});

rl.on('close', () => {
    console.log('end of file');
});

let match = (text) => {
    for (var i=0; i<utterances.length; i++) {
        var match = text.match(new RegExp(utterances[i].utterance, 'i'));
        if (match) {
            var handler = utterances[i].handler;
            console.log(handler+ ' '+ match);
            return {handler, match};
        } else {
            console.log('no match');
        }
    }
};
console.log(match);

exports.match = match;
