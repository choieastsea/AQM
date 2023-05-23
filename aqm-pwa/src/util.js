export const get25level = (pm25) => {
  // 초미세먼지 기준
  if (pm25 > 76) {
    return '매우나쁨';
  } else if (pm25 > 36) {
    return '나쁨';
  } else if (pm25 > 16) {
    return '보통';
  } else {
    return '좋음';
  }
};
export const get10level = (pm10) => {
  // 미세먼지 기준
  return (pm10 / 250) * 100;
};
