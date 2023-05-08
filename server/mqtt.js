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
    // console.log(AQData.pm10);
    // console.log(AQData.pm25);
    //mongodb에 저장 해야함
    // brew services mongodb-community restart하면, localhost:27017 에서 몽고디비 실행됨
  }
});

async function getData() {
  const aq_collection = db.collection('AQCollection');
  const seooul_collection = db.collection('SCollection');
  
  // 특정 조건을 만족하는 데이터를 가져옴
  const aq_data = await aq_collection.findOne({}, { sort: { _id: -1 } });
  const s_data = await seooul_collection.findOne({}, { sort: { _id: -1 } });
  
  if(s_data.pm10 < aq_data.pm10 || s_data.pm25 < aq_data.pm25){
    return '환기 시키세요';
  }
  // MongoDB 연결 종료
  // await client.close();
  
  return null;
}

// MQTT 클라이언트에게 데이터 전송
function sendData(data) {
  const client = mqtt.connect(MQTT_BROKER_IP);
  
  client.on('connect', function() {
    // 데이터를 JSON 형식으로 변환하여 클라이언트에게 전송
    client.publish('alert/airout', JSON.stringify(data), function() {
      console.log('Data published');
      
      // MQTT 연결 종료
      // client.end();
    });
  });
}

// 5분마다 MongoDB에서 데이터 가져오기
setInterval(async function() {
  console.log('Checking for new data');
  
  const data = await getData();
  
  if (data===null) {
    console.log('Alert to client:', data);
    
    // 데이터가 있으면 MQTT 클라이언트에게 전송
    sendData(data);
  } else {
    console.log('No new data');
  }
}, 5 * 60 * 1000);