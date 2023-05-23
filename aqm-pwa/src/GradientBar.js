import FiberManualRecordOutlinedIcon from '@mui/icons-material/FiberManualRecordOutlined';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';
const GradientBar = ({ indoor, outdoor }) => {
  const barStyle = {
    width: '100%',
    height: '20px',
    borderRadius: '5px',
    background: `linear-gradient(to right, #00e400, #ffff00, #ff7e00, #ff0000)`,
  };
  return (
    <>
      <div style={{ position: 'absolute', marginLeft: `${indoor}%` }}>
        <FiberManualRecordOutlinedIcon fontSize="small" />
      </div>
      <div style={{ position: 'absolute', marginLeft: `${outdoor}%` }}>
        <FiberManualRecordRoundedIcon fontSize="small" />
      </div>
      <div style={barStyle}></div>
      <div>
        <span style={{ marginLeft: '5%', fontSize: 12 }}>좋음</span>
        <span style={{ marginLeft: '15%', fontSize: 12 }}>보통</span>
        <span style={{ marginLeft: '15%', fontSize: 12 }}>나쁨</span>
        <span style={{ marginLeft: '15%', fontSize: 12 }}>매우 나쁨</span>
      </div>
      <div style={{ marginTop: 0 }}>
        <p style={{ fontSize: 10, marginBottom: 0, marginTop: 0, paddingBottom: 0 }}>
          <FiberManualRecordRoundedIcon fontSize="small" sx={{ transform: 'translateY(6px)' }} /> :
          실외{' '}, {' '}
          <FiberManualRecordOutlinedIcon fontSize="small" sx={{ transform: 'translateY(7px)' }} /> :
          실내
        </p>
        <p style={{ fontSize: 10, marginTop: 0 }}></p>
      </div>
    </>
  );
};

export default GradientBar;
