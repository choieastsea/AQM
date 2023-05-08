# AQM
Air Quality Manager(AQM) is a service that regularly compare air quality of indoor with outdoor and send alert to your Fitbit Charge 5

# 프로젝트 구조
- py-aqi : raspberry pi4와 연결된 SDS011 센서에서 python2.7을 이용하여 데이터를 가져온다

## EC2's broker server setting

(해당 내용은 13.124.171.90 인스턴스 기준 이미 완료된 상황임)

1. sudo apt update
2. sudo apt install mosquitto
3. sudo nano /etc/mosquitto/mosquitto.conf
4. 해당 파일에서, 다음 추가
listener 1883
allow_anonymous true
5. 해당 conf로 mosquitto broker server 실행
sudo mosquitto -c /etc/mosquitto/mosquitto.conf -v

## local nodejs server setting
1. npm install

2. /server/mqtt.js를 실행 (node mqtt.js)

3. EC2에서 돌아가는 broker server로부터 해당 topic을 구독하고, 메시지가 올때마다 콘솔에 찍는 것 까지 구현 완료

   ```
   connected!
   subscribe complete!
   /weather/particulatematter {"pm10": 12.3, "pm25": 11.0, "time": "08.05.2023 09:28:30"}
   /weather/particulatematter {"pm10": 12.2, "pm25": 10.9, "time": "08.05.2023 09:30:02"}
   /weather/particulatematter {"pm10": 12.9, "pm25": 11.5, "time": "08.05.2023 09:31:34"}
   /weather/particulatematter {"pm10": 12.4, "pm25": 11.0, "time": "08.05.2023 09:33:06"}
   /weather/particulatematter {"pm10": 13.7, "pm25": 10.7, "time": "08.05.2023 09:34:38"}
   /weather/particulatematter {"pm10": 12.6, "pm25": 11.2, "time": "08.05.2023 09:36:10"}
   /weather/particulatematter {"pm10": 17.7, "pm25": 11.1, "time": "08.05.2023 09:37:42"}
   ```

   현재 js 실행하면 이렇게 나오는게 정상