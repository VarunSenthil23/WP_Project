const express = require("express");
const dataparser = require('body-parser'); 
const readDataParser = dataparser(); 
const app = express();

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/game/login-page.html");
});

app.use(express.static("game"));

//Creating a database connection
var mysql = require('mysql');
var con = mysql.createConnection ({
    host : 'sql12.freemysqlhosting.net',
    user : 'sql12378281',
    password : '7nS8iX9Bav',
    database : 'sql12378281'
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected");
});

//Form authorization and taking user details from the client HTML (login-page.html)
app.post('login', readDataParser, function(req, res){
 
    username = req.body.username;
    password = req.body.password;

    //Username sanitization to allow only alphanumeric characters in the username
    username = username.replace(";","");
    username = username.replace("!","");
    username = username.replace("","");
    username = username.replace("#","");
    username = username.replace("$","");
    username = username.replace("%","");
    username = username.replace("^","");
    username = username.replace("&","");
    username = username.replace("*","");
    username = username.replace("(","");
    username = username.replace(")","");
    username = username.replace("@","");
    username = username.replace("=","");
    username = username.replace("{","");
    username = username.replace("}","");
    username = username.replace(">","");
    username = username.replace("<","");
    username = username.replace(":","");

    //To encrypt password
    var key = crypto.createCipher('aes-128-cbc', 'password');
    encryptedPassword = key.update(password, 'utf8', 'hex')
    encryptedPassword += key.final('hex');

    //Checking if the username exists to prevent multiple users with same username
    var usernameCheck = "SELECT * from login WHERE username = '" + username + "';";
    connection.query(usernameCheck, function(err, result){
        if (err) throw err;

        //If the user does exist
        if(result.length){
            //Checking if the username and password match
            var passCheck = "SELECT * from login WHERE password = '" + encryptedPassword + "';";
            
            connection.query(passCheck, function(err, result){
                if (err) throw err;
                console.log(result + " password");
                //If the password matches
                if (result.length){
                    console.log("one exists");
                    //The game starts
                    res.sendFile(__dirname + '/src/game.html');
                }

                //If passwords dont match, then error is shown to the user and login page restarts
                else{
                    console.log("Wrong password entered");
                    res.sendFile(__dirname + '/game/login-page.html')
                }
            });
        }

        //If the user does not exist
        else{
            console.log("none exists");

            //A new user is added to the table
            var sql = "INSERT INTO login (username, password) VALUES ('"+ username +"','"+encryptedPassword+"');";
            connection.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
            });
            //We jump to the game HTML
            res.sendFile(__dirname + '/src/game.html');
        }
    });
});

app.listen(3090);