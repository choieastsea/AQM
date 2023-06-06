import { Link, RouterProvider, createBrowserRouter, useLocation } from 'react-router-dom';
import MainPage from './MainPage';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import AirRoundedIcon from '@mui/icons-material/AirRounded';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRecoilState, useRecoilValue } from 'recoil';
import { fitbitToken, isAuthenticated } from './recoil';

const Index = () => {
  const [token, setToken] = useRecoilState(fitbitToken);
  const [auth, setAuth] = useRecoilState(isAuthenticated);
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [failOpen, setFailOpen] = useState(false);
  const [text, setText] = useState('');

  const getPermission = async () => {
    setText('get Permission');
    // check permission
    const result = await Notification.requestPermission();
    setText('request Permission');
    const registration = await navigator.serviceWorker.register('service-worker.js', {
      scope: './',
    });
    setLoading(true);
    setText('registration');
    if (result === 'granted') {
      setText('granted!!');
      const subscription = await registration.pushManager.subscribe({
        applicationServerKey:
          'BCO9W9otJhwejN50_8h3xKTV1RSeivUo_6LdI5OuQ5WAAwlB227duTtkfgMCgAbwSt3ZiA5DWAPTvBQiGYTp7xM',
        userVisibleOnly: true,
      });
      setText('subscribe success!!');
      await fetch('https://lccxa9jaxk.execute-api.ap-southeast-2.amazonaws.com/aq/subs', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
      setText('subscribe save success!!');
      setSuccessOpen(true);
      setShowButton(false);
    } else {
      setText('not granted!!');
      alert('알림을 거절하였습니다.');
      setFailOpen(true);
    }
    setLoading(false);
    // }
  };
  const requestRedirect = async () => {
    const { data } = await axios.get(
      'https://lccxa9jaxk.execute-api.ap-southeast-2.amazonaws.com/aq/fitbit'
    );
    const redirect_url = data?.body;
    window.location.href = redirect_url;
  };
  const requestLogin = async (code) => {
    const { data } = await axios.post(
      'https://lccxa9jaxk.execute-api.ap-southeast-2.amazonaws.com/aq/fitbit',
      { code }
    );
    const tokenReceived = {
      accessToken: data?.accessToken,
      refreshToken: data?.refreshToken,
      userId: data?.userId,
    };
    setToken(tokenReceived);
    setAuth(true);
    // window.location.href = `${window.location.href.split('/')[0]}/main`;
  };
  const [showButton, setShowButton] = useState(false);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      // 요청 보내서 token 받기
      requestLogin(code);
    } else {
      //code가 없는 경우.. (로그인 요청 x)
    }
  });
  useEffect(() => {
    if (
      window.Notification.permission === 'default' ||
      window.Notification.permission === 'denied'
    ) {
      setShowButton(true);
    }
  }, []);
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSuccessOpen(false);
    setFailOpen(false);
  };

  // 권한 받고, 로그인 시켜야 함
  return (
    <>
      {/* <Typography>{text}</Typography> */}
      <Typography sx={{ height: 200 }}></Typography>
      <Box display="flex" justifyContent="center">
        {showButton && (
          <Button onClick={getPermission} id="subscribe">
            알림 권한을 허용해주세요
          </Button>
        )}
      </Box>
      {loading && (
        <Box sx={{ display: 'flex' }} justifyContent="center">
          <CircularProgress />
        </Box>
      )}
      <Box display="flex" justifyContent="center">
        <Typography sx={{ height: 200 }}></Typography>
        <Button onClick={requestRedirect}>
          <img
            src="https://www.fitbit.com/global/content/dam/fitbit/global/product-logos/fitbit-new-logo-header.svg"
            alt="fitbit logo"
            height={30}
          />
          <Typography color={'black'} fontSize={30}>
            로그인하기
          </Typography>
        </Button>
        <Snackbar open={successOpen} autoHideDuration={4000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
            이제 공기질 데이터에 대한 알림을 받을 수 있습니다!
          </Alert>
        </Snackbar>
        <Snackbar open={failOpen} autoHideDuration={4000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="warning" sx={{ width: '100%' }}>
            공기질 데이터에 대한 알림을 받을 수 없습니다.
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

/** style **/
const appStyle = {
  position: 'sticky',
  top: 0,
  paddingTop: 'calc(0.3rem + env(safe-area-inset-top))',
  width: '100%',
  maxWidth: 600,
  margin: '0 auto',
};
const theme = createTheme({
  typography: {
    fontSize: 16,
    fontWeight: 600,
    fontFamily: ['Spoqa Han Sans Neo', 'sans-serif'].join(','),
  },
});

const App = () => {
  const authenticated = useRecoilValue(isAuthenticated);
  return (
    <ThemeProvider theme={theme}>
      <div style={appStyle}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography fontWeight={'bold'} color="#b2b6bf" fontSize={30} id="subscribe">
            <AirRoundedIcon sx={{ pl: 2, fontSize: 30, width: 35, transform: 'translateY(4px)' }} />
            AQM
          </Typography>
        </Box>
        {authenticated ? <MainPage /> : <Index />}
      </div>
    </ThemeProvider>
  );
};

export default App;
