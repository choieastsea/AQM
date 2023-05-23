import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
async function run() {
  // A service worker must be registered in order to send notifications on iOS
  const registration = await navigator.serviceWorker.register('service-worker.js', {
    scope: './',
  });
  console.log(registration);

  window.onload = async () => {
    console.log('onload!');
    // Triggers popup to request access to send notifications
    const result = await window.Notification.requestPermission();

    // If the user rejects the permission result will be "denied"
    if (result === 'granted') {
      const subscription = await registration.pushManager.subscribe({
        applicationServerKey:
          'BBLTYuDgxJqITNj_WD2Pp_HjQs3yfdZErOEuhLt_LUReh1a2O2TO4n53YT5vYTax29LZpeA055QxcrMUL7yVu44',
        userVisibleOnly: true,
      });
      try{
        await fetch('https://silent-experts-film.loca.lt/save-subscription', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription),
        });
      }catch(e){
        console.log(e);
      }
      
    }
  };
}
run();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
