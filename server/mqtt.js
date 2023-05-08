// mqtt broker server : 4주차 강의 참고

const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://13.124.171.90:1883'); // local mqtt broker를 이용
client.on('connect', () => {
  console.log('connected!');
  client.subscribe('/weather/particulatematter', () => {
    console.log('subscribe complete!');
  });
});

client.on('message', (topic, message) => {
    console.log(topic, message.toString());
})