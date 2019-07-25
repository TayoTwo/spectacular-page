console.log('server.js loaded');
//Required frameworks
const express = require('express');
const bodyParser = require("body-parser");
const fs = require('fs');
const mysql = require('mysql2/promise');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const app = express();

//Set up statics 
app.use(express.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(express.static('public'));

//Home directory
app.get('/', function (req, res) {
  console.log('Home page loaded');
  res.sendFile(__dirname + '/views/index.html');
});
app.get('/index.html', function (req, res) {
  console.log('Home page loaded');
  res.sendFile(__dirname + '/views/index.html');
});
//Login Page
app.get('/loggedin.html', function (req, res) {
  console.log('Login page loaded');
  res.sendFile(__dirname + '/views/loggedin.html');
});
//Show me all data in the table
app.get('/data', async function (req, res) {

  var sql = "SELECT * FROM users";
  const connection = mysql.createPool({

    host: "localhost",
    user: 'root',
    password: '',
    database: 'users',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0

  });

  const result = await connection.query(sql);

  res.json(JSON.parse(JSON.stringify(result[0])));

});
//Truncate the whole table
app.get('/clear', async function (req, res) {

  var sql = "TRUNCATE TABLE users";
  const connection = mysql.createPool({

    host: "localhost",
    user: 'root',
    password: '',
    database: 'users',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0

  });

  connection.query(sql);

  res.redirect('/');

});
//Login/Create account
app.post('/login', async function (req, res) {
  let {
    username,
    pw,
    signingIn
  } = req.body;
  let sql;
  //Sql query variable 
  //Create a connection pool
  const connection = mysql.createPool({

    host: "localhost",
    user: 'root',
    password: '',
    database: 'users',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0

  });

  //Is the variable defined?
  function isUndefined(value) {
    return typeof value === 'undefined';
  }
  //Check if username is in databse
  async function isUsernameUsed(name) {

    let source;
    let entry;
    name = name.toUpperCase();
    sql = "SELECT * FROM users";
    const result = await connection.query(sql);
    //Convery from RowDataPacket into readable values
    source = Object.values(JSON.parse(JSON.stringify(result[0])));
    const len = source.length;
    //Search through table data for any matches
    for (let index = 0; index < len; ++index) {
      entry = source[index];
      if (entry.username.toUpperCase() === name) {
        return entry;
      }
    }

    return false;

  }

  function hash(string, salt) {
    string = string.toString();
    var length = 10;
    //If no salt is given generate a new one
    if (isUndefined(salt)) {
      console.log("Generating a salt");
      salt = crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0, length); /** return required number of characters */

    }

    //Hash the string with the salt using sha512
    var hash = crypto.createHmac('sha512', salt).update(string).digest('hex');

    return [hash, salt];
  }

  //If the username or password is not given refresh the page
  if (isUndefined(username) || isUndefined(pw) || username == "" || pw == "") return res.redirect('/');

  //If creating an account
  if (!signingIn) {

    //Check if the username is already in the database
    if (await isUsernameUsed(username)) {
      //Look into sessions
      console.log("Username already in use");
      return res.redirect('/');

      //If not hash the users password
    } else {

      console.log("Hashing password");
      pw = hash(pw);

    }

    //Add user into the databse
    sql = `INSERT INTO users (username, password, salt) VALUES ('${username}','${pw[0]}','${pw[1]}')`;
    connection.query(sql, (err, rows, fields) => {
      if (err) {

        console.log("FAILURE INSERT");
        res.sendStatus(500);
        res.end();
        throw err;

      }

      console.log("SUCCESS INSERT");
      res.redirect('/');

    });

  } else {

    //Find username in database
    sql = `SELECT * FROM users WHERE username = '${username}'`;
    let result = await connection.query(sql);
    result = JSON.parse(JSON.stringify(result[0]))[0];

    console.log(hash(pw, result.salt) + "=>" + result.password);

    //If the password is correct log the user in
    if (hash(pw, result.salt)[0] == result.password) {

      console.log("Correct password");
      res.redirect('/loggedin.html');


    } else {
      //If not refresh the page
      console.log("Wrong password");
      res.redirect('/');

    }

  }


})
// listen for requests :)
var listener = app.listen((process.env.PORT || 3000), function () {
  console.log(`Your app is listening on port ${listener.address().port}`);
});