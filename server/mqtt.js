// mqtt client server
const AQI_TOPIC = '/weather/particulatematter'; // 실내 미세먼지 정보 관련 토픽
const MQTT_BROKER_IP = 'mqtt://localhost:1883';
const MONGO_DB_IP = 'mongodb://kkh:1234@localhost:27017/admin';
const mqtt = require('mqtt');
const mongoose = require('mongoose');

const client = mqtt.connect(MQTT_BROKER_IP); // local mqtt broker를 이용
const db = mongoose.connection;

db.on('error', () => {
  console.log('error mongodb');
});
db.on('open', () => {
  console.log('success mongodb');
});

client.on('connect', () => {
  //broker와 연결
  console.log('connected!');
  client.subscribe(AQI_TOPIC, () => {
    //AQI topic 구독 완료
    console.log(`subscribe ${AQI_TOPIC} complete!`);
    //mongodb 연결
    mongoose.connect(MONGO_DB_IP);
  });
});

client.on('message', (topic, message) => {
  // 구독중인 topic의 message 도착하면 실행되는 callback
  if (topic === AQI_TOPIC) {
    // 미세먼지 데이터 parsing
    const AQData = JSON.parse(message.toString());
    //AQData : { pm10: 5.7, pm25: 3.2, time: '08.05.2023 16:37:17' }
    db.collection('AQCollection').insertOne(AQData, function(err, result) {
      if (err) throw err;
      console.log('Saved to MongoDB:', AQData);
    });
    console.log(AQData.pm10);
    console.log(AQData.pm25);
    //mongodb에 저장 해야함
    // brew services mongodb-community restart하면, localhost:27017 에서 몽고디비 실행됨
  }
});
