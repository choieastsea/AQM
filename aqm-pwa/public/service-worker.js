self.addEventListener('push', function (event) {
  console.log('Push event received', event);
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    console.log('Notifications are not allowed');
    return;
  }

  // 푸시 알림 데이터 파싱
  var pushData = {};
  if (event.data) {
    pushData = event.data.json();
  }
  console.log(pushData);
  // 푸시 알림 옵션 구성
  var options = {
    body: pushData.body,
    // icon: 'path/to/notification-icon.png',
  };

  // 알림 생성
  self.registration.showNotification(pushData.title, options);
});
