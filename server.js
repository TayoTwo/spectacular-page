// server.js
// where your node app starts

// init project
const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
var bodyParser = require("body-parser");
const app = express();
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/data',function(req,res){

  let {username, pw} = req.body;

  var data = fs.readFile('./public/users.json');
  var path = __dirname + '/public/users.json';
  console.log(path);
  res.sendFile(path);

});

app.post('/', function (req, res) {

  let {username, pw} = req.body;

  var path = __dirname + '/public/users.json';
  var fileData = "";
  var obj;
  //Validation checks
    function isUndefined(value) {
      return typeof value === 'undefined';
    }

  //Check if file already is in JSON
  function isUsernameUsed(source, name) {
      var entry;
      name = name.toUpperCase();
      for (var index = 0; index < source.length; ++index) {
          entry = source[index];
          if (entry.username.toUpperCase().indexOf(name) != -1) {
            return true;
          }
      }

      return false;
  }
  function hash(string) {
    var h = 0;
    if (string.length == 0) {
        return  h;
    }
    for (var i = 0; i < string.length; i++) {
        var char = string.charCodeAt(i);
         h = (( h<<5)- h)+char;
         h =  h &  h; // Convert to 32bit integer
    }
    console.log(h);

    h = bcrypt.hashSync(h.toString(), 10);

    return h;
}

  if (isUndefined(username) || isUndefined(pw) || username == "" || pw == "") return res.sendFile(__dirname + '/views/index.html');

  //If not add to JSON
  fs.readFile(path, function (err, data) {
    if (err) {
        throw err;
    }
    fileData = data;
    obj = JSON.parse(fileData);

    if(isUsernameUsed(obj,username)){

      console.log("Username already in use");
      res.sendFile(__dirname + '/views/index.html');
      res.end();
      return;

    } else {

      pw = hash(pw.toString());

    }

    const userJson = {"username":`${username}`,"password":`${pw}`};

    obj.push(userJson);
    fs.writeFile(path,JSON.stringify(obj), (err) => {

      if (err) throw err;

      res.sendFile(__dirname + '/views/index.html');

    });

  });


})

// listen for requests :)
var listener = app.listen((process.env.PORT || 3000), function() {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
