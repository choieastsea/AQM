/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 *  npx react-native start
 */

import React, {useState} from 'react';
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

function App(): JSX.Element {
  const [connected, setConnected] = useState<boolean>(false);
  const [pm10, set10] = useState<string>('');
  const [pm25, set25] = useState<string>('');
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

      client.on('message', function (msg) {
        const data = JSON.parse(msg.data);
        Alert.alert(`pm10 : ${data.pm10}`);
        set10(data.pm10);
        set25(data.pm25);
      });

      client.on('connect', function () {
        console.log('connected');
        client.subscribe('/weather/particulatematter', 0);
      });

      client.connect();
    })
    .catch(function (err) {
      console.log(err);
    });

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
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
          <Text>Hello world</Text>
          <Text>{connected === true ? 'true' : 'false'}</Text>
          <Text>pm10 : {pm10}</Text>
          <Text>pm25 : {pm25}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
export default App;