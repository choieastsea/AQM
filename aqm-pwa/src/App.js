import { Box, Card, ThemeProvider, Typography, createTheme } from '@mui/material';
import AirRoundedIcon from '@mui/icons-material/AirRounded';
import React, { useEffect, useState } from 'react';
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';
import awsConfig from './awsConfig.json';
import { Amplify, PubSub } from 'aws-amplify';
import { topic } from './constants';
import axios from 'axios';

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
      axios.post('https://kind-rings-vanish.loca.lt/save-subscription', {
        subscriptionData: pushSubscription,
      });
      return true;
    });
}

/** aws iot core init **/
function init(awsConfig) {
  Amplify.configure({
    Auth: {
      userPoolId: awsConfig.cognitoUserPoolId,
      userPoolWebClientId: awsConfig.cognitoUserPoolClientId,
      identityPoolId: awsConfig.cognitoIdentityPoolId,
      region: awsConfig.region,
    },
  });

  Amplify.addPluggable(
    new AWSIoTProvider({
      aws_pubsub_region: awsConfig.region,
      aws_pubsub_endpoint: `wss://${awsConfig.mqttBrokerEndpoint}/mqtt`,
    })
  );
}

/** app component **/
function App() {
  const [indoorQuality, setIndoorQuality] = useState('');
  const [outdoorQuality, setOutdoorQuality] = useState('');

  init(awsConfig);

  /** useEffect **/
  useEffect(() => {
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
    });
    // askForNotificationPermission()
    //   .then(subscribeToPushNotifications)
    //   .then((res) => {
    //     if (res) alert('asdf');
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
            <Typography fontWeight="bold" gutterBottom>
              실시간 공기질 데이터 정보
            </Typography>
            <Typography>실내</Typography>
            <Typography>실외</Typography>
          </Card>
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default App;
