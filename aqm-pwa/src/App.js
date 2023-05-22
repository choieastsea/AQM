import { Box, Card, ThemeProvider, Typography, createTheme } from '@mui/material';
import AirRoundedIcon from '@mui/icons-material/AirRounded';
import React, { useEffect, useState } from 'react';
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';
import awsConfig from './awsConfig.json';
import { Amplify, PubSub, Auth } from 'aws-amplify';
import { topic } from './constants';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

/** style **/
const appStyle = {
  position: 'sticky',
  top: 0,
  paddingTop: 'calc(0.3rem + env(safe-area-inset-top))',
};
const theme = createTheme({
  typography: {
    fontSize: 16,
    fontWeight: 600,
    fontFamily: ['Spoqa Han Sans Neo', 'sans-serif'].join(','),
  },
});

const data = [
  {
    name: '08:00',
    실내: 4000,
    실외: 2400,
  },
  {
    name: '09:00',
    실내: 3000,
    실외: 1398,
  },
  {
    name: '10:00',
    실내: 2000,
    실외: 9800,
  },
  {
    name: '11:00',
    실내: 2780,
    실외: 3908,
  },
  {
    name: '12:00',
    실내: 1890,
    실외: 4800,
  },
  {
    name: '13:00',
    실내: 2390,
    실외: 3800,
  },
  {
    name: '14:00',
    실내: 3490,
    실외: 4300,
  },
];

const renderLineChart = (
  <LineChart
    width={340}
    height={200}
    data={data}
    margin={{
      top: 10,
      right: 30,
      left: 0,
      bottom: 5,
    }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="실외" stroke="#8884d8" activeDot={{ r: 2 }} />
    <Line type="monotone" dataKey="실내" stroke="#82ca9d" />
  </LineChart>
);

/** push alarm permission **/
function askForNotificationPermission() {
  return new Promise(function (resolve, reject) {
    const permissionResult = Notification.requestPermission(function (result) {
      resolve(result);
    });
    if (permissionResult) {
      permissionResult.then(resolve, reject);
    }
  }).then(function (permissionResult) {
    if (permissionResult !== 'granted') {
      throw new Error('푸시 알림 허가가 거부되었습니다.');
    }
  });
}

function subscribeToPushNotifications() {
  return navigator.serviceWorker
    .register('/service-worker.js')
    .then(function (registration) {
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey:
          'BBLTYuDgxJqITNj_WD2Pp_HjQs3yfdZErOEuhLt_LUReh1a2O2TO4n53YT5vYTax29LZpeA055QxcrMUL7yVu44', // Push 서버의 공개 키
      };
      return registration.pushManager.subscribe(subscribeOptions);
    })
    .then(function (pushSubscription) {
      console.log('푸시 알림 구독 성공:', pushSubscription.endpoint);
      return pushSubscription;
    })
    .then((pushSubscription) => {
      // 서버와 구독관계로 연결
      console.log(pushSubscription);
      axios.post('https://gold-pants-yawn.loca.lt/save-subscription', {
        subscriptionData: pushSubscription,
      });
      return true;
    });
}

/** aws iot core init **/
function init(awsConfig) {
  Amplify.Logger.LOG_LEVEL = 'VERBOSE';
  console.log(awsConfig);

  Amplify.addPluggable(
    new AWSIoTProvider({
      aws_pubsub_region: awsConfig.region,
      aws_pubsub_endpoint: `wss://${awsConfig.mqttBrokerEndpoint}/mqtt`,
    })
  );

  Amplify.configure({
    Auth: {
      userPoolId: awsConfig.cognitoUserPoolId,
      userPoolWebClientId: awsConfig.cognitoUserPoolClientId,
      identityPoolId: awsConfig.cognitoIdentityPoolId,
      region: awsConfig.region,
    },
  });
}

/** app component **/
function App() {
  const [indoorQuality, setIndoorQuality] = useState('3.3');
  const [outdoorQuality, setOutdoorQuality] = useState('2.3');
  init(awsConfig);

  /** useEffect **/
  useEffect(() => {
    Auth.currentCredentials().then((info) => {
      console.log(info.identityId);
    });
    PubSub.subscribe(topic, {
      provider: 'AWSIoTProvider',
    }).subscribe({
      next: (data) => {
        // setFields(data.value.fields);
        // setValues(data.value.values);
        // setProvider(JSON.stringify(data));
        console.log(data);
      },
      error: (error) => console.log(error),
      complete: () => console.log('Done'),
    });
    // askForNotificationPermission()
    //   .then(subscribeToPushNotifications)
    //   .then((res) => {
    //     if (res) alert('asdf');
    //     else {
    //       alert('fail!');
    //     }
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //   });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div style={appStyle}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography fontWeight={'bold'} color="#b2b6bf" fontSize={24}>
            <AirRoundedIcon sx={{ pl: 2, height: 30, transform: 'translateY(6px)' }} />
            AQM
          </Typography>
        </Box>
        <Box sx={{ p: 1.5 }}>
          <Card sx={{ p: 2, borderRadius: 3.5 }} elevation={0}>
            <Typography fontWeight="bold" mb={2}>
              실시간 공기질 데이터 정보
            </Typography>
            <Typography>실내 {indoorQuality}</Typography>
            <Typography>실외 {outdoorQuality}</Typography>
          </Card>
          <Box m={2} />
          <Card sx={{ p: 2, borderRadius: 3.5 }} elevation={0}>
            <Typography fontWeight="bold" mb={2}>
              공기질 데이터 추이
            </Typography>
            {renderLineChart}
          </Card>
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default App;
