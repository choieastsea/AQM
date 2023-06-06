import { Box, Card, Container, Grid, Tab, Tabs, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import GradientBar from './GradientBar';
import { get10level } from './util';
import { useRecoilValue } from 'recoil';
import { fitbitToken } from './recoil';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function TabPanel(props) {
  const { children, showDegree, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={showDegree !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {showDegree === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

/** Main component **/
function MainPage() {
  const [airQuality, setAirQuality] = useState({ indoor: '3.3', outdoor: '2.3' });
  const [fitbitInfo, setFitbitInfo] = useState({
    status: 0,
    activityInfo: { activeTime: 0, calories: 0, steps: 0 },
    userInfo: { age: 0, gender: '', height: 0.0, name: '' },
  });
  const [chartData, setChartData] = useState([]);
  const [time, setTime] = useState('');
  const [showDegree, setShowDegree] = useState(0);
  const [showFitbit, setShowFitbit] = useState(false);
  const token = useRecoilValue(fitbitToken);

  const handleChange = (e, newDegree) => {
    setShowDegree(newDegree);
  };
  const fetchData = async () => {
    const updateTime = () => {
      const currentDate = new Date();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const date = String(currentDate.getDate()).padStart(2, '0');
      const hours = String(currentDate.getHours()).padStart(2, '0');
      const minutes = String(currentDate.getMinutes()).padStart(2, '0');
      const currentTime = `${month}월 ${date}일 ${hours}시${minutes}분`;
      setTime(currentTime);
    };

    try {
      updateTime();
      const [chart, current] = await axios.all([
        axios.get('https://lccxa9jaxk.execute-api.ap-southeast-2.amazonaws.com/aq/chart'),
        axios.get('https://7h6957xq5g.execute-api.ap-southeast-2.amazonaws.com/aq/get_pm'),
      ]);
      const {
        data: { body: currentData },
      } = current;
      const aq_data = JSON.parse(currentData);
      console.log(aq_data);
      setAirQuality({ indoor: aq_data?.indoor, outdoor: aq_data?.outdoor });
      const {
        data: { body: chartData },
      } = chart;
      const aq_chart = JSON.parse(chartData);
      const data = [];
      for (let i = 0; i < 6; i++) {
        const currentDate = new Date();
        const hours = currentDate.getHours();
        const el = {
          name: `${hours - (6 - i)}"`,
          실내: parseInt(aq_chart?.indoor.pm10[i] * 10),
          실외: parseInt(aq_chart?.outdoor.pm10[i]),
        };
        console.log(el);
        data.push(el);
      }
      console.log(data);
      setChartData(data);
    } catch (error) {
      console.log('API 요청 실패:', error);
    }
  };
  const fetchFitbitData = async (token) => {
    if (token?.userId?.length > 0) {
      const { data } = await axios.post(
        'https://lccxa9jaxk.execute-api.ap-southeast-2.amazonaws.com/aq/fitbit_api',
        {
          accessToken: token.accessToken,
          userId: token.userId,
        }
      );
      console.log(data);
      setFitbitInfo(data);
    }
  };
  /** useEffect **/
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000 * 60); //1분마다 요청
    // 컴포넌트 언마운트 시 clearInterval을 통해 타이머 제거
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    fetchFitbitData(token);
  }, [token]);

  return (
    <Box sx={{ p: 1.5 }}>
      <Card sx={{ p: 2, borderRadius: 3.5 }} elevation={0}>
        <Typography fontWeight="bold" mb={1}>
          실시간 공기질 데이터 정보
        </Typography>
        <Typography style={{ fontSize: 15, color: 'grey' }} mb={1}>
          {time}
        </Typography>
        <GradientBar
          indoor={get10level(airQuality?.indoor?.pm10 * 20)}
          outdoor={get10level(airQuality?.outdoor?.pm10)}
        />
        {/* 100% 중 30% */}
      </Card>
      <Card sx={{ p: 2, borderRadius: 3.5, mt: 2 }} elevation={0}>
        <Box
          display="flex"
          justifyContent="space-between"
          onClick={() => {
            setShowFitbit((f) => !f);
          }}
        >
          <Typography fontWeight="bold" alignSelf="flex-start" gutterBottom>
            fitbit 정보
          </Typography>
          {showFitbit ? (
            <KeyboardArrowUpIcon sx={{ alignSelf: 'flex-end' }} />
          ) : (
            <KeyboardArrowDownIcon sx={{ alignSelf: 'flex-end' }} ƒ />
          )}
        </Box>
        <Box
          className={`content ${showFitbit ? 'open' : ''}`}
          sx={{ maxHeight: showFitbit ? 'none' : 0 }}
        >
          <Typography>
            {fitbitInfo.userInfo?.name} ({fitbitInfo.userInfo?.age} 세)
          </Typography>
          <Typography>오늘의 활동 🏋️ {fitbitInfo.activityInfo?.calories}kcal</Typography>
          <Typography>오늘의 걸음 🚶‍♂️ {fitbitInfo.activityInfo?.steps}걸음</Typography>
          {/* <Typography>{airQuality.outdoor}</Typography> */}
          {airQuality.outdoor.pm10 < 30 && (
            <Typography align="center" m={1} color="#3f51b5" fontWeight={600}>
              "오늘은 날이 좋으니 밖에 나가보아요"
            </Typography>
          )}
          {airQuality.outdoor.pm10 > 30 && airQuality.outdoor.pm10 < 80 && (
            <Typography align="center" m={1} color="#8bc34a" fontWeight={600}>
              "오늘은 날이 보통이에요!"
            </Typography>
          )}
          {airQuality.outdoor.pm10 > 80 && airQuality.outdoor.pm10 < 150 && (
            <Typography align="center" m={1} color="#ffc400" fontWeight={600}>
              오늘은 미세먼지가 나쁨이니 나갈때 마스크를 착용해주세요
            </Typography>
          )}
          {airQuality.outdoor.pm10 > 150 && (
            <Typography align="center" m={1} color="#a31545" fontWeight={600}>
              오늘은 미세먼지가 매우 나쁘니 바깥 활동을 자제해주세요
            </Typography>
          )}
        </Box>
      </Card>
      <Card sx={{ p: 2, borderRadius: 3.5, mt: 2 }} elevation={0}>
        <Typography fontWeight="bold">상세 정보</Typography>
        <Container>
          <Tabs value={showDegree} onChange={handleChange} variant="fullWidth">
            <Tab label="미세먼지" />
            <Tab label="초미세먼지" />
          </Tabs>
          <TabPanel showDegree={showDegree} index={0}>
            <Grid container>
              <Grid item xs={6}>
                <Typography align="center">
                  실내{' '}
                  {airQuality?.indoor?.pm10 * 20 ? (airQuality?.indoor?.pm10 * 20).toFixed(0) : '-'}{' '}
                  <span style={{ transform: 'translateY(-1px)', display: 'inline-block' }}>
                    ㎍/㎥
                  </span>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="center">
                  실외 {airQuality?.outdoor?.pm10 || '-'}{' '}
                  <span style={{ transform: 'translateY(-1px)', display: 'inline-block' }}>
                    ㎍/㎥
                  </span>
                </Typography>
              </Grid>
            </Grid>
            <Typography fontSize={12} mt={2} color={'grey'} align="center">
              0~30㎍/㎥는 좋음, 31~80㎍/㎥는 보통
              <br /> 81~150㎍/㎥는 나쁨, 151 이상은 매우 나쁨
            </Typography>
          </TabPanel>
          <TabPanel showDegree={showDegree} index={1}>
            <Grid container>
              <Grid item xs={6}>
                <Typography align="center">
                  실내 {(airQuality?.indoor?.pm25 * 20).toFixed(0)}{' '}
                  <span style={{ transform: 'translateY(-1px)', display: 'inline-block' }}>
                    ㎍/㎥
                  </span>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="center">
                  실외 {airQuality?.outdoor?.pm25}{' '}
                  <span style={{ transform: 'translateY(-1px)', display: 'inline-block' }}>
                    ㎍/㎥
                  </span>
                </Typography>
              </Grid>
            </Grid>
            <Typography fontSize={12} mt={2} color={'grey'} align="center">
              0~15㎍/㎥는 좋음, 16~25㎍/㎥는 보통
              <br /> 36~75㎍/㎥는 나쁨, 76 이상은 매우 나쁨
            </Typography>
          </TabPanel>
        </Container>
      </Card>
      <Box m={2} />
      <Card sx={{ p: 2, borderRadius: 3.5 }} elevation={0}>
        <Typography fontWeight="bold" mb={2}>
          공기질 데이터 추이
        </Typography>
        <LineChart
          width={340}
          height={200}
          data={chartData}
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
      </Card>
    </Box>
  );
}

export default MainPage;
