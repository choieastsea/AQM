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
const moment = require('moment-timezone');

function callAPI() {
    var url = 'http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty';
    var queryParams = '?' + encodeURIComponent('serviceKey') + '=' + serviceKey;
    queryParams += '&' + encodeURIComponent('returnType') + '=' + encodeURIComponent('json'); /* */
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('100'); /* */
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* */
    queryParams += '&' + encodeURIComponent('stationName') + '=' + encodeURIComponent('광진구'); /* */
    queryParams += '&' + encodeURIComponent('dataTerm') + '=' + encodeURIComponent('DAILY'); /* */
    queryParams += '&' + encodeURIComponent('ver') + '=' + encodeURIComponent('1.0'); /* */

    axios.get(url + queryParams)
        .then(response => {
            recent_data = response.data.response.body.items[0]
            pm10 = recent_data["pm10Value"]
            pm25 = recent_data["pm25Value"]

            currentTime = new Date();
            console.log(`pm10 : ${pm10}, pm25 : ${pm25}, "time" : "${currentTime}"`)
            data = JSON.parse(`{"pm10" : "${pm10}", "pm25" : "${pm25}", "time" : "${currentTime}"}`)
            db.collection('SCollection').insertOne(data, function (err, result) {
                if (err) throw err;
                console.log('Saved to MongoDB:', data);
            });
        })
        .catch(error => {
            console.log(error)
        });
}

const getOuterPM = async () => {
    const currentTime = new Date();
    const apiData = [];

    const res = await db.collection('SCollection').find({}).toArray();
    for (var i = 0; i < res.length; i++) {
        const time = new Date(res[i].time);
        if (currentTime - time < 2 * 60 * 60 * 1000) {
            apiData.push(res[i]);
        }
    }
    console.log(apiData);
    return apiData;
}

const getInnerPM = async() =>{
    const currentTime = new Date();
    const sensorData = [];
    currentTime.setHours(currentTime.getHours()+9)

    const res = await db.collection('AQCollection').find({}).toArray();
    //10초마다 저장될때 5분짜리 데이터를 보내주기 위해서
    var count = 0;
    for (var i = 0 ; i<res.length; i++){
        const time = new Date(res[i].time);
        if (currentTime - time <2*60*60*1000){
            if (count==0){
                sensorData.push(res[i]);
                count+=1
            }
            else{
                count+=1
                if (count%30 == 0){
                    count = 0
                }
            }
        }
    }
    console.log(sensorData);
    return sensorData;
}

app.get('/getpm', async(req, res) => {
    outerData = await getOuterPM()
    innerData = await getInnerPM()
    res.send({innerData, outerData})
})

setInterval(() => {
    callAPI()
}, 300000)

app.listen(port, () => {
    console.log(`Listening on port : ${port}`)
    //mongodb 연결
    mongoose.connect(MONGO_DB_IP);
})
