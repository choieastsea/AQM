const express = require('express')
const axios = require('axios')
const { MqttClient } = require('mqtt')
const app = express()

const MONGO_DB_IP = 'mongodb://kkh:1234@localhost:27017/admin';
const mongoose = require('mongoose');
const db = mongoose.connection;

const port = 3000
const serviceKey = "9OdEbSYuSWsY3x8Jk%2Bm%2FbFKeOKKPfY6olRpGAUQ8QVVC3xgfbEq8NdZvwscyJTv0KpH2TJIX3E3YylLo%2BUntsA%3D%3D"
const interval = 100000

function callAPI(){
    var url = 'http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty';
    var queryParams = '?' + encodeURIComponent('serviceKey') + '=' + serviceKey;
    queryParams += '&' + encodeURIComponent('returnType') + '=' + encodeURIComponent('json'); /* */
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('100'); /* */
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* */
    queryParams += '&' + encodeURIComponent('stationName') + '=' + encodeURIComponent('광진구'); /* */
    queryParams += '&' + encodeURIComponent('dataTerm') + '=' + encodeURIComponent('DAILY'); /* */
    queryParams += '&' + encodeURIComponent('ver') + '=' + encodeURIComponent('1.0'); /* */
 
    axios.get(url + queryParams)
    .then(response =>{
        recent_data = response.data.response.body.items[0]
        console.log(recent_data)
        pm10 = recent_data["pm10Value"]
        pm25 = recent_data["pm25Value"]
        console.log(`pm10 : ${pm10}, pm25 : ${pm25}`)
        data = JSON.parse(`{"pm10" : "${pm10}", "pm25" : "${pm25}"}`)
            db.collection('SCollection').insertOne(data, function(err, result) {
            if (err) throw err;
            console.log('Saved to MongoDB:', data);
          });
    })
    .catch(error =>{
        console.log(error)
    });
}

app.get('/', (req, res)=>{
    callAPI()
    res.send("Hello World")
})

setInterval(()=>{
    callAPI()
}, 500000)

app.listen(port, ()=>{
    console.log(`Listening on port : ${port}`)
    //mongodb 연결
    mongoose.connect(MONGO_DB_IP);
})
