/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 *  npx react-native start
 */

import React, {useEffect, useState} from 'react';
import {INDOOR_AQI_TOPIC, OUTDOOR_AQI_TOPIC, ALERT_TOPIC} from './constant';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import MQTT from 'sp-react-native-mqtt';
import axios from 'axios';
import {
  VictoryBar,
  VictoryChart,
  VictoryTheme,
  VictoryLine,
  VictoryAxis,
} from 'victory-native';

function App(): JSX.Element {
  const [pm10, set10] = useState<string>('');
  const [pm25, set25] = useState<string>('');

  const [pm10Out, set10Out] = useState<string>('');
  const [pm25Out, set25Out] = useState<string>('');

  const [chartData, setChartData] = useState({innerData: [], outerData: []});

  const fetchAQChart = async () => {
    const {data} = await axios.get('http://13.125.247.254:3000/getpm');
    setChartData(data);
  };

  useEffect(() => {
    fetchAQChart();
  }, []);

  MQTT.createClient({
    uri: 'mqtt://13.125.247.254:1883',
    clientId: '01024572321',
  })
    .then(function (client) {
      client.on('closed', function () {
        console.log('mqtt.event.closed');
      });

      client.on('error', function (msg) {
        console.log('mqtt.event.error', msg);
      });

      client.on('message', function ({data, topic}) {
        if (topic === INDOOR_AQI_TOPIC) {
          // 실내 공기질 데이터
          const {pm10, pm25} = JSON.parse(data);
          set10(pm10);
          set25(pm25);
        }
        if (topic === OUTDOOR_AQI_TOPIC) {
          // 실외 공기질 데이터
          const {pm10, pm25} = JSON.parse(data);
          set10Out(pm10);
          set25Out(pm25);
        }
        if (topic === ALERT_TOPIC) {
          // 경고 문구
          Alert.alert(data);
        }
      });

      client.on('connect', function () {
        console.log('connected');
        client.subscribe(INDOOR_AQI_TOPIC, 0);
        client.subscribe(OUTDOOR_AQI_TOPIC, 0);
        client.subscribe(ALERT_TOPIC, 0);
      });

      client.connect();
    })
    .catch(function (err) {
      console.log(err);
    });

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    padding: 15,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Text style={{fontSize: 30, marginBottom: 5}}>실내 공기질 현황</Text>
          <Text style={{fontSize: 20, marginBottom: 5}}>미세먼지 : {pm10}</Text>
          <Text style={{fontSize: 20, marginBottom: 5}}>
            초미세먼지 : {pm25}
          </Text>

          <Text style={{fontSize: 30, marginBottom: 5}}>실외 공기질 현황</Text>
          <Text style={{fontSize: 20, marginBottom: 5}}>
            미세먼지 : {pm10Out}
          </Text>
          <Text style={{fontSize: 20, marginBottom: 5}}>
            초미세먼지 : {pm25Out}
          </Text>

          {/* <Text style={{fontSize: 30}}>공기질 데이터 추이 (pm10)</Text>
          <Text>파란색 : 실내 , 초록색 : 실외</Text>
          <VictoryChart
            width={350}
            theme={VictoryTheme.material}
            maxDomain={{y: 60}}>
            <VictoryAxis tickFormat={() => ''} />
            <VictoryLine
              data={chartData.innerData.map(el => parseFloat(el?.pm10))}
              interpolation="natural"
            />
            <VictoryLine
              data={chartData.outerData.map(el => parseFloat(el?.pm10))}
              style={{data: {stroke: 'green'}}}
              interpolation="natural"
            />
          </VictoryChart> */}
          <Text style={{fontSize: 30, marginBottom: 5}}>
            공기질 데이터 추이 (pm2.5)
          </Text>
          <Text>파란색 : 실내 , 초록색 : 실외</Text>
          <VictoryChart
            width={350}
            theme={VictoryTheme.material}
            maxDomain={{y: 40}}>
            <VictoryAxis tickFormat={() => ''} />
            <VictoryLine
              data={chartData.innerData.map(el => parseFloat(el?.pm25))}
              interpolation="natural"
              labels={({datum}) => (datum.x === 10 ? '실내' : '')}
            />
            <VictoryLine
              data={chartData.outerData.map(el => parseFloat(el?.pm25))}
              style={{data: {stroke: 'green'}}}
              interpolation="natural"
              labels={({datum}) => (datum.x === 10 ? '실외' : '')}
            />
          </VictoryChart>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
export default App;
