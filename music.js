const express = require('express')
const app = express()
const port = 3006
const admin = require('firebase-admin');
const request = require('request');

const serviceAccount = require('./musickey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.set("views engine", "ejs");

app.get('/home', (req, res) => {
  res.render(__dirname+"/public/"+"home.ejs");
});

app.get('/signup', (req, res) => {
  res.render(__dirname+"/public/"+"signup.ejs");
});

app.get('/signupSubmit', function (req, res) {
  db.collection('submit').add({
    Name:req.query.name,
    Email:req.query.email,
    Password:req.query.password,
    ConfirmPassword:req.query.confirmpassword
  }).then(()=>{
  res.render(__dirname+"/public/"+"signupSubmit.ejs");
  })
});

app.get('/login', (req, res) => {
  res.render(__dirname+"/public/"+"login.ejs");
});

app.get('/loginSubmit', function (req, res) {
  db.collection('submit')
  .where("Email" ,"==",req.query.email)
  .where("Password","==",req.query.password)
  .get()
  .then((docs)=>{
    if(docs.size>0){
     res.render(__dirname+"/public/"+"main.ejs");
    }
    else{
      res.send("Failed,Please signup first");
    }
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
          country:country,
          country_code:country_code,
          region_code:region_code,
          region:region,
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
