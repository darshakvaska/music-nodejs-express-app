const express = require('express')
const app = express()
const port = 3006
const admin = require('firebase-admin');
const request = require('request');
var passwordHash = require("password-hash");


const serviceAccount = require('./musickey.json');
const bodyParser = require('body-parser');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}));
app.set("views engine", "ejs");

app.get('/home', (req, res) => {
  res.render(__dirname+"/public/"+"home.ejs");
});

app.get('/signup', (req, res) => {
  res.render(__dirname+"/public/"+"signup.ejs");
});

app.post('/signupSubmit', function (req, res) {
  const hashedPassword = passwordHash.generate(req.body.password);
  db.collection('submit').where("Email","==",req.body.email).get()
  .then((docs) => {
    if(docs.size>0){
      res.send("This email is already exists")
    }
    else{
      db.collection('submit').add({
        Name:req.body.name,
        Email:req.body.email,
        Password:hashedPassword,
        ConfirmPassword:req.body.confirmpassword
      }).then(()=>{
      res.render(__dirname+"/public/"+"signupSubmit.ejs");
      });
    }
  });
  
});

app.get('/login', (req, res) => {
  res.render(__dirname+"/public/"+"login.ejs");
});

app.post('/loginSubmit', function (req, res) {

  const enteredPassword = req.body.password;


  db.collection('submit')
  .where("Email" ,"==",req.body.email)
  //.where("Password","==",req.body.password)
  .get()
  .then((docs)=>{
    if (docs.size>0){
      docs.forEach((doc)=>{
        const hashedPassword=doc.data().Password;
        if (passwordHash.verify(enteredPassword,hashedPassword)){
          res.render(__dirname+"/public/"+"main.ejs");
        }else{
          res.send("Fail");
        }
      })
    }else{
      res.send("Failed");
    }
    //let verified=false;
    //docs.forEach((doc)=>{
     // verified=passwordHash.verify(req.body.password,doc.data().password);
    //});

    //if(docs.size>0){
     //res.render(__dirname+"/public/"+"main.ejs");
    //}
    //else{
     // res.send("Failed,Incorrect email or password");
    //}
  });
  
});


app.get('/datasubmit', (req, res) => {
  const name = req.query.gds;
  console.log(name);

  request.get({
    url: 'https://api.api-ninjas.com/v1/urllookup?url=' + name,
    headers: {
      'X-Api-Key': '68SxlmpDEqIOnrlqDf4QJw==CJ89JwteaHNT1Z6g'
    },
  },function (error, response, body){
      if("error" in JSON.parse(body)){
        if((JSON.parse(body).error.code.toString()).length > 0){
          res.render(__dirname+"/public/"+"main.ejs");
        }
      }
      else{
        const is_valid= JSON.parse(body).is_valid;
        const country= JSON.parse(body).country;
        const country_code= JSON.parse(body).country_code;
        const region_code= JSON.parse(body).region_code;
        const region= JSON.parse(body).region;
        const city= JSON.parse(body).city;
        const zip= JSON.parse(body).zip;
        const lat= JSON.parse(body).lat;
        const lon= JSON.parse(body).lon;
        const timezone= JSON.parse(body).timezone;
        const isp= JSON.parse(body).isp;
        const url= JSON.parse(body).url;

        res.render(__dirname+"/public/"+"mainSubmit.ejs",{
          is_valid:  is_valid,
          country: country,
          country_code: country_code,
          region_code: region_code,
          region: region,
          city: city,
          zip: zip,
          lat:lat ,
          lon: lon,
          timezone: timezone,
          isp: isp,
          url: url
        });
    } 
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})