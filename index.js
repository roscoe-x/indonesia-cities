const express = require('express')
const app = express()
//const PORT = 3000
const PORT = process.env.PORT || 8080;
//var MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');
//var url = "mongodb://35.240.240.28:27017/indonesiaprovincesdb";
var url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0-tpcht.mongodb.net/test?retryWrites=true`

var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: true });
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
const test = require('assert');
var fs = require('fs');
var dd = require('./ddmodule');
const crypto = require('crypto');
var moment = require('moment');

const secret = 'hidupberharga.com';

app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressSession({
    secret: 'hidupberharga.com',
    resave: false,
    saveUninitialized: true
}))

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

var auth = function(req, res, next) {
    console.log(req.session.user);  
    if (req.session && req.session.user !== null && req.session.admin)
        return next();
    else {
        res.setHeader('Content-Type', 'text/html')
        res.write("<br><a href='/login'>Please Login</a>")
        res.end()
        //return res.sendStatus(401);
    }
};

MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) throw err;
    //console.log("Database created!");
    //db.close();
    var emptyflag = 0;
    var dbo = client.db("indonesiaprovincesdb");
    dbo.listCollections().toArray(function (err, items) {
        if (err) throw err;

        console.log(items);
        if (items.length == 0) {
            console.log("No collections in database")
            emptyflag = 1;
            console.log("Empty flag 1 : " + emptyflag)
        }

        console.log("Empty flag 2 : " + emptyflag)
        

        if (emptyflag == 1) {
            console.log("Let's write database")
            fs.readFile('IndonesiaProvinces.json', 'utf8', function (err, data) {
                if (err) throw err;
                var jsonquery = JSON.parse(data, null, 2);

                dbo.collection("provinces").insertMany(jsonquery, function (err, docs) {
                    if (err) throw err;
                    console.log("Number of documents inserted : " + docs.insertedCount);
                });
            });

            // Example: insertOne()
            /*var myobj = { name: "PT. Palugada", address: "Cisauk" };
            {"_id":"516","province":"Maluku Utara","city":"Ternate","Note":"Kota","area":"111"}
            dbo.collection("customers").insertOne(myobj, function(err, res) {
                if (err) throw err;
                console.log("1 document in customers inserted!");
                client.close();
              });*/

            // Example: insertMany()
            /*var myobj = [{ name: "PT. Palugada", address: "Cisauk" },
                { name: "PT. Maju Terus", address: "Cisauk" },
                { name: "PT. Jalan Besar", address: "Cilenggang" }];
            dbo.collection("customers").insertMany(myobj, function(err, res) {
                if (err) throw err;
                console.log("Number of documents inserted : " + res.insertedCount);
                client.close();
              });*/
        } /*else {
            dbo.collection("provinces").drop(function(err, delOK) {
                if (err) throw err;
                if (delOK) console.log("Collection deleted");
                client.close();
            });
        }*/
    });


});

app.get('/register', function (req, res) {
    var html =''
    res.setHeader('Content-Type', 'text/html')
    res.write('<br>Register using the form below.')
        
    html += "<form action='/register'  method='post' name='form1'>";
    html += "<div id='divParent'>";
    html += "<div id='div1' name='formset' class='formset'>";
    html += "<p>User name: <input type= 'text' name='username' required></p>";
    html += '<p>Email: <input type="text" name="email" required></input></p>';
    html += "<p>Password: <input type='password' name='pwd' id='pwd' onkeyup='checkPassword()' required></p>";
    html += "<p>Confirm password: <input type='password' name='confirmpwd' id='confirmpwd' onkeyup='checkPassword()' required></p>";
    html += '<p id="divCheckPasswordMatch"></p>';
    html += "</div>";
    html += "</div>";
    html += "<input id='input1' type='submit' value='Sign-up'>";
    html += "<INPUT type='reset'  value='Reset'>";
    html += "</form>";    
    html += `<script>
    
   var i = 0;
   
   
   function checkPassword() {
   var pw1 = document.getElementById('pwd').value;
   var pw2 = document.getElementById('confirmpwd').value;
   
   
   if (pw1 === pw2) {
       document.getElementById('divCheckPasswordMatch').style.color = 'green';
       document.getElementById("divCheckPasswordMatch").innerHTML = "Password match.";
       document.getElementById("input1").disabled = false;
   } else {
       document.getElementById('divCheckPasswordMatch').style.color = 'red';
       document.getElementById("divCheckPasswordMatch").innerHTML = "Password is different!";
       document.getElementById("input1").disabled = true;
   }
   }
   
    </script>`
    res.write(html);
    res.end()
});

app.post('/register', urlencodedParser, function (req, res) {
    res.setHeader('Content-Type', 'text/html')
    var reply='';
    console.log(req.body.username)

    
    const hash = crypto.createHmac('sha256', secret)
                   .update(req.body.pwd)
                   .digest('hex');

    reply += "<br>User name is : " + req.body.username;
    reply += "<br>Password is : " + hash; 

    /*MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("indonesiaprovincesdb");

        dbo.collection("customers").createIndex( { username: 1 }, { unique: true } )

        memberobject = { username: req.body.username, email: req.body.email, password: req.body.pwd }
        try {
            dbo.collection("member").insertOne(memberobject);
            reply += "<br>1 document in member inserted";
            reply += "<p><a href='/'>Back to home page</a>"
            console.log("1 document in member inserted");
        } catch (e) {
            console.log("Error ========")
            console.log(e);
        }
    })*/
    MongoClient.connect(url, { useNewUrlParser: true })
        .then(function (db) { // <- db as first argument
            //console.log(db)
            var dbo = db.db("indonesiaprovincesdb");

            dbo.collection("member").createIndex( { username: 1 }, { unique: true } )

            memberobject = { username: req.body.username, email: req.body.email, password: hash }
            dbo.collection("member").insertOne(memberobject)
            .then(function (result) {
                reply += "<br>1 document in member inserted";
                reply += "<p><a href='/'>Back to home page</a>"
                console.log("1 document in member inserted");
                res.send(reply)
                res.end()
            })
            .catch(function (err) {
                console.log("Error -----------")
                console.log(err);
            })
        })
        .catch(function (err) {
            console.log("Error ========")
            console.log(err);
        })
});

app.get('/login', function (req, res) {
    var html =''
    res.setHeader('Content-Type', 'text/html')
    html += `<head><title>Indonesia Provinces - Login</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <style>
        .right {
            position: absolute;
            right: 10px;
        }
    </style></head>`
    
    res.write('<br>Please login to view content.')
        
    html += "<form action='/login'  method='post' name='form1'>";
    html += "<div id='divParent'>";
    html += "<div id='div1' name='formset' class='formset'>";
    html += "<p>User name: <input type= 'text' name='username'></p>";
    html += "<p>Password: <input type='password' name='pwd'></p>";
    html += "</div>";
    html += "</div>";
    html += "<input id='input1' type='submit' value='Login'>";
    html += "<INPUT type='reset'  value='Reset'>";
    html += "</form>";    
    html += "<br><a href='/register'>or Register</a>";
    //html += "<br><a href='/checkmember'>Check member</a>" 
    res.write(html);
    res.end()
});

app.post('/login', urlencodedParser, function (req, res) {
    
    const hash = crypto.createHmac('sha256', secret)
                   .update(req.body.pwd)
                   .digest('hex');

    res.setHeader('Content-Type', 'text/html')
    var reply='';
    //console.log(req.body.username)
    //console.log(req.body.pwd)

    MongoClient.connect(url, { useNewUrlParser: true })
        .then(function (db) { // <- db as first argument
            //console.log(db)
            var dbo = db.db("indonesiaprovincesdb");

            //dbo.collection("member").createIndex( { username: 1 }, { unique: true } )

            var query1 = { username: req.body.username, password: hash }
            //var o_id = new ObjectID(cityId)
            //myquery = { username: cityId };
            dbo.collection("member").findOne(query1)
            //dbo.collection("member").insertOne(memberobject)
            .then(function (result) {
                req.session.user = result.username;
                req.session.admin = true;
                console.log("User name is : "+result.username);
                db.close();
                res.redirect(301, '/')
            })
            .catch(function (err) {
                console.log("Login failed")
                console.log(err);
            })
        })
        .catch(function (err) {
            console.log("Error connect to DB")
            console.log(err);
        })
     
    /*if (!req.body.username || !req.body.pwd) {
        res.send('login failed');
    } else if(req.body.username === "roy" || hash === "c46894173ec96737a9299c227abe40564f6e39d7e74dca5b59b5cd228d5cd66b") {
        req.session.user = "roy";
        req.session.admin = true;
        //res.write("<br>Login successful!<br>")
        //res.write(req.session.user);
        
        //res.end();
        res.redirect(301, '/')
    }*/
});

app.get('/logout', function (req, res) {
    req.session.destroy();
    res.send("logout success!");
    //res.redirect(301, '/')
});

/*app.get('/checkmember', function (req, res) {
    res.setHeader('Content-Type', 'text/html')
    reply ='';
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("indonesiaprovincesdb");

        dbo.collection("member").createIndex( { username: 1 }, { unique: true } )

        //memberobject = { username: req.body.username, email: req.body.email, password: req.body.pwd }
            dbo.collection("member").find({}).toArray(function(err, result) {
                if (err) throw err;

                for (i=0; i<result.length; i++) {
                    reply += "<br>"+JSON.stringify(result[i], null, 4);
                }
                
                console.log(result);
                db.close();
                res.write(reply);
                res.end()
            })
    })
    
});*/

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html')
    var html='';
    html += `<head><title>Indonesia Provinces</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <style>
        .right {
            position: absolute;
            right: 10px;
        }
    </style></head>`
    if (req.session.user === "roy") {
        res.write("<br><a class='right' href='/logout'>Log Out</a>")
    } else {
        res.write("<br><a class='right' href='/login'>Login</a>")
    }
    res.write('<h1>Indonesia Provinces</h1>')
    res.write('This application will show you Indonesia Provinces and its Regencies and Cities')
    
    html += "<form action='/search'  method='post' name='form1'>";
    html += "<div id='divParent'>";
    html += "<div id='div1' name='formset' class='formset'>";
    html += "<p>Province: <input type= 'text' name='province'></p>";
    html += "<p>Regency / City: <input type='text' name='city'></p>";
    html += "</div>";
    html += "</div>";
    html += "<input id='input1' type='submit' value='Search'>";
    html += "<input type='reset'  value='Reset'>";
    html += "</form>";

    html += "<h1>Indonesia Presidents</h1>"
    html += "<form action='/searchpresident'  method='post' name='form2'>";
    
    html += "<div id='div1' name='formset' class='formset'>";
    html += "<p>Name: <input type= 'text' name='president'></p>";
    //html += "<p>Start term: <input type='text' name='start'></p>";
    //html += "<p>End term: <input type='text' name='end'></p>";
    html += "</div>";
    html += "<input id='input2' type='submit' value='Search'>";
    html += "<input type='reset'  value='Reset'>";
    html += "</form>";

    html += `<a href="/showallprovinces" class="btn btn-info" role="button">Show All Provinces</a>`
    html += `<a href="/school" class="btn btn-info" role="button">School</a>`
    html += `<a href="/hotels" class="btn btn-info" role="button">Hotels</a>`
    html += `<a href="/airport" class="btn btn-info" role="button">Airport</a>`
    res.write(html);
    res.end()
})

app.get('/showallprovinces', (req, res) => {
    res.setHeader('Content-Type', 'text/html')
    var html='';
    html += `<head><title>Indonesia Provinces</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <style>
    table {
        width:100%;
    }
    table, th, td {
        border: 1px solid black;
        border-collapse: collapse;
    }
    th, td {
        padding: 15px;
        text-align: left;
    }
    table#t01 tr:nth-child(even) {
        background-color: #eee;
    }
    table#t01 tr:nth-child(odd) {
       background-color: #fff;
    }
    table#t01 th {
        background-color: green;
        color: white;
    }
        .right {
            position: absolute;
            right: 10px;
        }
    </style></head>`
    if (req.session.user === "roy") {
        res.write("<br><a class='right' href='/logout'>Log Out</a>")
    } else {
        res.write("<br><a class='right' href='/login'>Login</a>")
    }
    res.write('<h1>Indonesia Provinces</h1>')
    res.write('This application will show you Indonesia Provinces')

    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("indonesiaprovincesdb");

        // distinct()
        var query2 = "province";
        dbo.collection("provinces").find({ Note: { $regex : 'ibu ', $options : 'i' }}).toArray(function(err, result) {
        //dbo.collection("provinces").distinct(query2, function(err, result) {
        //dbo.collection("provinces").find({}).toArray(function(err, result) {
            if (err) throw err;
            //console.log("\n5. ");
            console.log(result);
            html += `<table id="t01">
            <tr>
              <th>No</th>
              <th>Province</th> 
              <th>City / Regency</th>
              <th>Note</th>
              <th>Kecamatan</th>
            </tr>`
            for (var i = 0, len = result.length; i < len; i++) {
                if (result[i].kecamatan === undefined)
                    html += "<tr><td>"+(i+1)+"</td><td>"+result[i].province +"</td><td><a href='/city?cityid="+result[i]._id+"'>"+ result[i].city+"<a/></td><td>"+result[i].Note+"</td><td><a href='/insertkecamatan?cityid="+result[i]._id+"'>Insert Kecamatan</a></td></tr>"
                else
                    html += "<tr><td>"+(i+1)+"</td><td>"+result[i].province +"</td><td><a href='/city?cityid="+result[i]._id+"'>"+ result[i].city+"<a/></td><td>"+result[i].Note+"</td><td>"+result[i].kecamatan+"</td></tr>"
              }
            html += '</table>'
            res.write(html)
            res.end()
            db.close();
        });
    })
})

app.get('/school', (req, res) => {
    res.setHeader('Content-Type', 'text/html')
    var html='';
    html += `<head><title>School List</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script>
    </head>`
    res.write('<h1>School in Indonesia Provinces</h1>')
    res.write('This application will show you School List in Indonesia Provinces and its Regencies and Cities')
    res.write(html);
    res.end()
})

app.get('/hotels', (req, res) => {
    res.setHeader('Content-Type', 'text/html')
    var html='';
    html += `<head><title>Hotel List</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script></head>`
    res.write('<h1>Hotels in Indonesia Provinces</h1>')
    res.write('This application will show you Hotel List in Indonesia Provinces and its Regencies and Cities')

    html += "<form action='/hotels'  method='post' name='hotelform'>";
    html += "<div id='divParent'>";
    html += "<div id='div1' name='formset' class='formset'>";
    html += "<p>Hotel name: <input type='text' name='name'></p>"
    html += "<p>Hotel address: <input type='text' name='address'></p>"
    html += "<p>Phone number: <input type='text' name='phone'></p>"
    html += "<p>Regency / City: <input type='text' name='city'></p>";
    html += "<p>Province: <input type= 'text' name='province'></p>";
    html += "</div>";
    html += "</div>";
    html += "<input id='hotelform' type='submit' value='Save'>";
    html += "<input type='reset'  value='Reset'>";
    html += "</form>";

    html += "<form action='/searchhotel'  method='post' name='searchhotel'>";
    html += "<div id='divParent'>";
    html += "<div id='div1' name='formset' class='formset'>";
    html += "<p>Hotel name: <input type='text' name='name'></p>"
    html += "<p>Regency / City: <input type='text' name='city'></p>";
    html += "<p>Province: <input type= 'text' name='province'></p>";
    html += "</div>";
    html += "</div>";
    html += "<input id='input1' type='submit' value='Search'>";
    html += "<input type='reset'  value='Reset'>";
    html += "</form>";
    res.write(html);
    res.end()
})

app.post('/searchhotel', urlencodedParser, function (req, res){
    var reply='';
    reply += `<head>
    <style>
    table {
        width:100%;
    }
    table, th, td {
        border: 1px solid black;
        border-collapse: collapse;
    }
    th, td {
        padding: 15px;
        text-align: left;
    }
    table#t01 tr:nth-child(even) {
        background-color: #eee;
    }
    table#t01 tr:nth-child(odd) {
       background-color: #fff;
    }
    table#t01 th {
        background-color: green;
        color: white;
    }
    .right {
        position: absolute;
        right: 10px;
    }
    </style>
     </head>`;
    //reply += "<br><a class='right' href='/logout'>Log Out</a>"
    reply += "<br>Array length is : " + req.body.name.length;
    reply += "<br>Hotel name is : " + req.body.name;
    reply += "<br>City is : " + req.body.city; 
    //res.write(reply);

    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("indonesiaprovincesdb");
        
        // find()
        var query = { $or : [ { province: { $regex : req.body.province, $options : 'i' }},
            {city: { $regex: req.body.city, $options: 'i' }}, { hotelname: { $regex: req.body.name, $options: 'i'}}]};
        console.log(query);
        dbo.collection("hotels").find(query).toArray(function(err, result) {
            if (err) throw err;
            //console.log("\n5. ");
            console.log(result);
            reply += "<br><br>Result is:<br>";
            //var result2 = JSON.stringify(result);
            //reply += result2;
            //reply += "No&emsp;Province&emsp;City/Regency<br>"
            reply += `<table id="t01">
            <tr>
              <th>No</th>
              <th>Hotel</th> 
              <th>City / Regency</th>
              <th>Province</th>
            </tr>`
            for (var i = 0, len = result.length; i < len; i++) {
                reply += "<tr><td>"+(i+1)+"</td><td>"+result[i].hotelname +"</td><td>"+ result[i].city+
                   "</td><td>"+result[i].province+"</td></tr>"
              }
            db.close();
            res.send(reply);
        });
        
    });
});

app.post('/hotels', auth, urlencodedParser, function (req, res){
    var cityId= req.query.cityid;
    var reply='';
    var isJson = 0;
    reply += "<br>City id is : " + cityId;

    //console.log(req.body)

        reply += "<br>Array length is : " + req.body.name.length;
        reply += "<br>Hotel name is : " + req.body.name;

    
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;

        var emptyflag = 0;
        var dbo = db.db("indonesiaprovincesdb");
        
        var cityName;
        //var o_id = new ObjectID(cityId)
        var myobj = { hotelname: req.body.name, address: req.body.address, 
            phone: req.body.phone, city: req.body.city, province: req.body.province, insertdate: new Date() };
                console.log(myobj)
                dbo.collection("hotels").insertOne(myobj, function(err, res) {
                    if (err) throw err;
                    console.log("1 document in hotels inserted!");
                    reply += "1 document in hotels inserted!"
                    db.close();
                });
        
                dbo.collection('hotels').countDocuments().then((count) => {
                    console.log("No of hotels in database : "+count);
                    reply += "No of hotels in database : "+count;
                    res.send(reply);
                });
    });
})

app.get('/airport', (req, res) => {
    res.setHeader('Content-Type', 'text/html')
    var html='';
    html += `<head><title>Airport List</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script></head>`
    html += `<head>
    <style>
    table {
        width:100%;
    }
    table, th, td {
        border: 1px solid black;
        border-collapse: collapse;
    }
    th, td {
        text-align: left;
    }
    table#t01 tr:nth-child(even) {
        background-color: #eee;
    }
    table#t01 tr:nth-child(odd) {
       background-color: #fff;
    }
    table#t01 th {
        background-color: green;
        color: white;
    }
    </style>
     </head>`;
    html += '<h1>Airports in Indonesia Provinces</h1>'
    html += 'This application will show you Airport List in Indonesia Provinces and its Regencies and Cities'
    html += "<form action='/search'  method='post' name='form1'>";
    html += `<table id="t01">
            <tr>
              <th>No</th>
              <th>Name</th> 
              <th>ICAO</th>
              <th>IATA</th>
              <th>Province</th>
              <th>City/Regency</th>
            </tr>`
            var htmldd = dd.dropDown()
        
            html += "<tr><td>1</td><td><input type= 'text' name='name'></td><td><input type= 'text' name='icao'></td><td><input type= 'text' name='iata'></td><td>"+htmldd+"</td><td><input type= 'text' name='city'></td></tr>";
            html += "<tr><td>2</td><td><input type= 'text' name='name'></td><td><input type= 'text' name='icao'></td><td><input type= 'text' name='iata'></td><td>"+htmldd+"</td><td><input type= 'text' name='city'></td></tr>";
            html += "<tr><td>3</td><td><input type= 'text' name='name'></td><td><input type= 'text' name='icao'></td><td><input type= 'text' name='iata'></td><td>"+htmldd+"</td><td><input type= 'text' name='city'></td></tr>";
            html += "<tr><td>4</td><td><input type= 'text' name='name'></td><td><input type= 'text' name='icao'></td><td><input type= 'text' name='iata'></td><td>"+htmldd+"</td><td><input type= 'text' name='city'></td></tr>";
            html += "<tr><td>5</td><td><input type= 'text' name='name'></td><td><input type= 'text' name='icao'></td><td><input type= 'text' name='iata'></td><td>"+htmldd+"</td><td><input type= 'text' name='city'></td></tr>";
            html += "</table>";
            html += "<input id='input1' type='submit' value='Save'>";
            html += "<INPUT type='reset'  value='Reset'>";
            html += "</form>";
    res.write(html);
    res.end()
})

app.post('/search', urlencodedParser, function (req, res){
    var reply='';
    reply += `<head>
    <style>
    table {
        width:100%;
    }
    table, th, td {
        border: 1px solid black;
        border-collapse: collapse;
    }
    th, td {
        padding: 15px;
        text-align: left;
    }
    table#t01 tr:nth-child(even) {
        background-color: #eee;
    }
    table#t01 tr:nth-child(odd) {
       background-color: #fff;
    }
    table#t01 th {
        background-color: green;
        color: white;
    }
    .right {
        position: absolute;
        right: 10px;
    }
    </style>
     </head>`;
    //reply += "<br><a class='right' href='/logout'>Log Out</a>"
    reply += "<br>Array length is : " + req.body.province.length;
    reply += "<br>Province name is : " + req.body.province;
    reply += "<br>City is : " + req.body.city; 
    //res.write(reply);

    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("indonesiaprovincesdb");

        // distinct()
        /*var query2 = "province";
        dbo.collection("provinces").distinct(query2, { province: { $regex : req.body.province, $options : 'i' }}, function(err, result) {
            if (err) throw err;
            //console.log("\n5. ");
            console.log(result);
        });*/
        
        // find()
        var query = { $and : [ { province: { $regex : req.body.province, $options : 'i' }},
            {city: { $regex: req.body.city, $options: 'i' }}]};
        console.log(query);
        dbo.collection("provinces").find(query).toArray(function(err, result) {
            if (err) throw err;
            //console.log("\n5. ");
            console.log(result);
            reply += "<br><br>Result is:<br>";
            //var result2 = JSON.stringify(result);
            //reply += result2;
            //reply += "No&emsp;Province&emsp;City/Regency<br>"
            reply += `<table id="t01">
            <tr>
              <th>No</th>
              <th>Province</th> 
              <th>City / Regency</th>
              <th>Note</th>
              <th>Kecamatan</th>
            </tr>`
            for (var i = 0, len = result.length; i < len; i++) {
                //console.log(result[i].kecamatan)
                if (result[i].kecamatan === undefined)
                    reply += "<tr><td>"+(i+1)+"</td><td>"+result[i].province +"</td><td><a href='/city?cityid="+result[i]._id+"'>"+ result[i].city+"<a/></td><td>"+result[i].Note+"</td><td><a href='/insertkecamatan?cityid="+result[i]._id+"'>Insert Kecamatan</a></td></tr>"
                else 
                reply += "<tr><td>"+(i+1)+"</td><td>"+result[i].province +"</td><td><a href='/city?cityid="+result[i]._id+"'>"+ result[i].city+"<a/></td><td>"+result[i].Note+"</td><td>"+result[i].kecamatan+"</td></tr>"
              }
            db.close();
            res.send(reply);
        });
        
    });
});

app.get('/insertkecamatan', auth, (req, res) => {
    res.setHeader('Content-Type', 'text/html')
    var html='';
    var cityId = req.query.cityid;
    html += `<head><title>Insert Kecamatan</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <style>
    .right {
        position: absolute;
        right: 10px;
    }
    </style></head>`

    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("indonesiaprovincesdb");

        var cityName;
        //var o_id = new ObjectID(cityId)
        myquery = { _id: cityId };
        dbo.collection("provinces").findOne(myquery, function(err, result) {
            if (err) throw err;
            console.log("\n1. ");
            console.log(result);
            cityName = result.city;
            db.close();

            console.log("\n2. ")
            res.write("<br><a class='right' href='/logout'>Log Out</a>")
            res.write(`<h1>Insert kecamatan in ${cityName}</h1>`)
            //res.write('This application will show you Hotel List in Indonesia Provinces and its Regencies and Cities')
            html += "<form action='/insertkecamatan?cityid="+cityId+"'  method='post' name='form1'>";
            html += "<div id='divParent'>";
            //html += "<h3>Insert country name and full name</h3>"
            html += "<div id='div1' name='formset' class='formset'>";
            html += "<p>Kecamatan name: <input type= 'text' name='kecamatan'></p>";
            html += "<p>Kecamatan name: <input type= 'text' name='kecamatan'></p>";
            html += "<p>Kecamatan name: <input type= 'text' name='kecamatan'></p>";
            html += "<p>Kecamatan name: <input type= 'text' name='kecamatan'></p>";
            html += "<p>Kecamatan name: <input type= 'text' name='kecamatan'></p>";
            html += "</div>";
            html += "</div>";
            html += "<input id='input1' type='submit' value='Save'>";
            html += "<INPUT type='reset'  value='Reset'>";
            html += "</form>";

            html += "<p>Or Insert Kecamatan Array</p>"
            html += "<form action='/insertkecamatan?cityid="+cityId+"'  method='post' id='form2' name='form2'>";
            html += "<input type= 'hidden' name='isstring' value='1'>";
            html += "<p>Kecamatan name: </p>";
            html += "<input id='input2' type='submit' value='Save'>";
            html += "<INPUT type='reset'  value='Reset'>";
            html += '<textarea rows="4" cols="50" name="kecamatan" form="form2"></textarea>';

            var arrayNo;
            console.log(JSON.stringify(result.kecamatan))
            if (result.kecamatan == null) {
                arrayNo = 0;
            } else {
                arrayNo = result.kecamatan.length
            }
            var indexNo=0;

            html += "<br><br>Existing kecamatan in "+cityName+":<br>";
            for (var i = 0; i < arrayNo; i++) {
                indexNo++;
                html += `${indexNo}. ${result.kecamatan[i]}<br>`;
            }

            res.write(html);
            res.end()
          });

    });

})

app.post('/insertkecamatan', auth, urlencodedParser, function (req, res){
    var cityId= req.query.cityid;
    var reply='';
    var isJson = 0;
    reply += "<br>City id is : " + cityId;

    //console.log(req.body)

        reply += "<br>Array length is : " + req.body.kecamatan.length;
        var kecamatan;
        if (req.body.isstring == 1) {
            reply += "<br>isstring is : 1"
            var isJson = IsJsonString(req.body.kecamatan)
            if (isJson) {   // If string is Json, use JSON.parse()
                kecamatan = JSON.parse(req.body.kecamatan);
            } else {   // If string is not Json, use comma separated string
                kecamatan = req.body.kecamatan.split(",");
            }
            
            reply += "<br>Kecamatan name is : " + kecamatan;
        } else {
            reply += "<br>isstring is : 2"
            kecamatan = req.body.kecamatan;
            reply += "<br>Kecamatan name is : " + kecamatan;
        }
        

    
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;

        var emptyflag = 0;
        var dbo = db.db("indonesiaprovincesdb");
        
        var cityName;
        //var o_id = new ObjectID(cityId)
        myquery = { _id: cityId };
        dbo.collection("provinces").findOne(myquery, function(err, result) {
            if (err) throw err;
            console.log("\n1. ");
            console.log(result);
            cityName = result.city;
        });

        //newvalues = { $addToSet: { kecamatan: { $each: req.body.kecamatan }, $set: { updateDate: new Date() }} };
        //newvalues = { $unset: { kecamatan: "", updateDate: new Date() } };
        //newvalues = { $set: { kecamatan: req.body.kecamatan, updateDate: new Date() } };
        //newvalues = {  $set: {updateDate: new Date() }, $push: { kecamatan: { $each: req.body.kecamatan } } };
        newvalues = {  $set: {updateDate: new Date() }, $addToSet: { kecamatan: { $each: kecamatan } } };  // If use $push duplicate in array is possible
        //newvalues = { $pull: {kecamatan: ""}}   // use $pull to delete empty array
        try {
            dbo.collection("provinces").updateOne(myquery, newvalues);
            console.log("1 document updated");
        } catch (e) {
            console.log(e);
        }

        dbo.collection("provinces").findOne(myquery, function(err, result) {
            if (err) throw err;
            //console.log("\n1. Insert provinces");
            console.log(result);

            var arrayNo;
            if (result.kecamatan == null) {
                arrayNo = 0;
            } else {
                arrayNo = result.kecamatan.length
            }
            var indexNo=0;

            reply += "<br><br>Existing kecamatan in "+cityName+":<br>";
            for (var i = 0; i < arrayNo; i++) {
                indexNo++;
                reply += `${indexNo}. ${result.kecamatan[i]}<br>`;
            }

            res.send(reply);
            res.end();
        });
    });
})

app.post('/searchpresident', auth, urlencodedParser, function (req, res){
    
    var reply='';

    //console.log(req.body)
        reply += "<br>President name is : " + req.body.president;

    
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;

        var emptyflag = 0;
        var dbo = db.db("indonesiaprovincesdb");
        
        /*var o_id = new ObjectID('5c359025ceb9ce38e834bb89')
        var myquery = { _id: o_id };
        dbo.collection("president").deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
            db.close();
        });*/
        
        /*myobj = { name: req.body.president, startterm: req.body.start, endterm: req.body.end, insertDate: new Date() };
        dbo.collection("president").insertOne(myobj, function(err, res1) {
            if (err) throw err;
            console.log("\n1. ");
            console.log(res1.ops);*/

            var query = { name: { $regex : req.body.president, $options : 'i' }};
            dbo.collection("president").find(query).toArray(function(err, result) {
                if (err) throw err;
                console.log("\n2. ");
                console.log(result);
                db.close();

                var indexNo=0;
    
                reply += "<br><br>Presidents list:<br>";
                //console.log(result[0].name)
                for (var i = 0; i < result.length; i++) {
                    indexNo++;
                    reply += `${indexNo}. ${result[i].name} (${result[i].startterm} - ${result[i].endterm})<br>`;
                }
    
                res.send(reply);
                res.end();
            });
        //});
        /*dbo.collection("president").drop(function(err, delOK) {
            if (err) throw err;
            if (delOK) console.log("Collection deleted");
            res.end();
        });*/
    });
})

app.get('/city', (req, res) => {
    res.setHeader('Content-Type', 'text/html')
    var html='';
    var cityId = req.query.cityid;
    html += `<head><title>City/Regency Info</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <style>h2 {background-color: green;}
    .news {
        background-color: #eeeeff;
      }
    </style></head>`

    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("indonesiaprovincesdb");

        var cityName;
        //var o_id = new ObjectID(cityId)
        myquery = { _id: cityId };
        //var newvalues = { $set: {Note: "Kabupaten. Karawang" } };
        //dbo.collection("provinces").updateOne(myquery, newvalues, function(err, result) {
        dbo.collection("provinces").findOne(myquery, function(err, result) {
            if (err) throw err;

            cityName = result.city;
            var note = result.Note;
            note = note.split(".")
            //db.close();

            res.write(`<h1>${note[0]} ${cityName} Info </h1>`)
            res.write(`${cityName} adalah ${note[0]} di Provinsi ${result.province}.`)

            /*var newvalues = { $set: { cityid: 16 } };
            dbo.collection("news").updateMany({}, newvalues, function(err, res) {
                if (err) throw err;
                console.log(res.result.nModified + " document(s) updated");
                db.close();
              });*/
            var myquery2 = {cityid: Number(cityId)};
            console.log(myquery2)
            dbo.collection("news").find(myquery2).sort({_id: -1}).toArray(function(err, result2) {
                if (err) throw err;
                //console.log("\n5. ");
                console.log(result2);
                db.close();

                html += '<h2>News</h2>';
                html += `<a href='/insertnews?cityid=${cityId}'>Insert News</a>`
            

                if (result2.length === 0) {
                    html += "<br>No existing news in "+cityName;
                } else {
                    for (var i = 0; i < result2.length; i++) {
                        var d = moment(result2[i].insertdate);

                        html += `<div class='news'><h3>${result2[i].title}</h3>`
                        html += `<p>Author is ${result2[i].author}. Published on : ${d.format("MMM DD YYYY, h:mm a")}`
                        html += `<p>${result2[i].content}<p>`
                        html += `<p>Link:<br>${result2[i].link}`
                        html += `</div>`
                    }
                }

                html += '<h2>Kecamatan</h2>'
                var arrayNo;
                console.log(JSON.stringify(result.kecamatan))
                if (result.kecamatan == null) {
                    arrayNo = 0;
                } else {
                    arrayNo = result.kecamatan.length
                }
                var indexNo = 0;

                html += "<br>Daftar kecamatan yg berada di " + cityName + ":<br>";
                for (var i = 0; i < arrayNo; i++) {
                    indexNo++;
                    html += `${indexNo}. ${result.kecamatan[i]}<br>`;
                }


                res.write(html);
                res.end()
            })

        })
    })
})

app.get('/insertnews', auth, (req, res) => {
    res.setHeader('Content-Type', 'text/html')
    var html='';
    var cityId = req.query.cityid;
    html += `<head><title>Insert News</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <style>
    .right {
        position: absolute;
        right: 10px;
    }
    </style></head>`

    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("indonesiaprovincesdb");

        var cityName;
        //var o_id = new ObjectID(cityId)
        myquery = { _id: cityId };
        dbo.collection("provinces").findOne(myquery, function(err, result) {
            if (err) throw err;
            console.log("\n1. ");
            console.log(result);
            cityName = result.city;
            db.close();

            console.log("\n2. ")
            res.write("<br><a class='right' href='/logout'>Log Out</a>")
            res.write(`<h1>Insert news in ${cityName}</h1>`)
            //res.write('This application will show you Hotel List in Indonesia Provinces and its Regencies and Cities')
            html += "<form action='/insertnews?cityid="+cityId+"'  method='post' name='form1'>";
            html += "<div id='divParent'>";
            //html += "<h3>Insert country name and full name</h3>"
            html += "<div id='div1' name='formset' class='formset'>";
            html += "<p>Title: <input type= 'text' name='title'></p>";
            html += "<p>Content: <textarea name='content'></textarea></p>";
            html += "<p>Link: <input type= 'text' name='link'></p>";
            html += "</div>";
            html += "</div>";
            html += "<input id='input1' type='submit' value='Save'>";
            html += "<INPUT type='reset'  value='Reset'>";
            html += "</form>";

            /*var arrayNo;
            console.log(JSON.stringify(result.kecamatan))
            if (result.kecamatan == null) {
                arrayNo = 0;
            } else {
                arrayNo = result.kecamatan.length
            }
            var indexNo=0;

            html += "<br><br>Existing news in "+cityName+":<br>";
            for (var i = 0; i < arrayNo; i++) {
                indexNo++;
                html += `${indexNo}. ${result.kecamatan[i]}<br>`;
            }*/

            res.write(html);
            res.end()
          });

    });

})

app.post('/insertnews', auth, urlencodedParser, function (req, res){
    var cityId= req.query.cityid;
    var reply='';
    var isJson = 0;
    reply += "<br>City id is : " + cityId;

    //console.log(req.body)

        
        reply += "<br>News title is : " + req.body.title;
        reply += "<br>News content is : "+ req.body.content;
        reply += "<br>Link is : "+req.body.link;

    
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;

        var emptyflag = 0;
        var dbo = db.db("indonesiaprovincesdb");
        
        var cityName;
        //var o_id = new ObjectID(cityId)
        myquery = { _id: cityId };
        dbo.collection("provinces").findOne(myquery, function(err, result) {
            if (err) throw err;
            console.log("\n1. ");
            console.log(result);
            cityName = result.city;
        });

        //newvalues = { $addToSet: { kecamatan: { $each: req.body.kecamatan }, $set: { updateDate: new Date() }} };
        //newvalues = { $unset: { kecamatan: "", updateDate: new Date() } };
        //newvalues = { $set: { kecamatan: req.body.kecamatan, updateDate: new Date() } };
        //newvalues = {  $set: {updateDate: new Date() }, $push: { kecamatan: { $each: req.body.kecamatan } } };
        //newvalues = {  $set: {updateDate: new Date() }, $addToSet: { kecamatan: { $each: req.body.kecamatan } } };  // If use $push duplicate in array is possible
        //newvalues = { $pull: {kecamatan: ""}}   // use $pull to delete empty array
        newsobject = { title: req.body.title, content: req.body.content, link: req.body.link, 
            author: req.session.user, cityid: Number(cityId), insertdate: new Date() }
        try {
            dbo.collection("news").insertOne(newsobject);
            reply += "<br>1 document in news inserted";
            reply += "<p><a href=/city?cityid="+cityId+">Back to City page</a>"
            console.log("1 document in news inserted");
        } catch (e) {
            console.log(e);
        }
        res.send(reply)

        
    });
})

app.listen(PORT, () => console.log(`Server listening on port ${PORT}!`))
