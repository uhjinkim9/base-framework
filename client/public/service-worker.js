self.addEventListener("push", (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      data: data.data, // 여기 저장됨
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/"; // 여기서 꺼내쓰기
  event.waitUntil(clients.openWindow(url));
});

// // Service Worker 설치 이벤트
// self.addEventListener('install', (event) => {
//   console.log('Service Worker 설치됨');
//   self.skipWaiting(); // 새 Service Worker를 즉시 활성화
// });

// // Service Worker 활성화 이벤트
// self.addEventListener('activate', (event) => {
//   console.log('Service Worker 활성화됨');
//   event.waitUntil(self.clients.claim()); // 모든 클라이언트를 제어하도록 설정
// });

// // 푸시 메시지 수신 처리
// self.addEventListener('push', (event) => {
//   console.log('푸시 메시지 수신:', event);

//   if (!event.data) {
//     console.log('푸시 데이터가 없습니다');
//     return;
//   }

//   try {
//     const payload = event.data.json();
//     console.log('푸시 페이로드:', payload);

//     const notificationOptions = {
//       body: payload.body || payload.message || '새로운 알림이 있습니다',
//       icon: '/ucube-symbol-color.png', // 실제 존재하는 아이콘 경로
//       badge: '/ucube-symbol-color.png',
//       data: payload.data || { url: '/' },
//       actions: [
//         {
//           action: 'open',
//           title: '열기'
//         },
//         {
//           action: 'close',
//           title: '닫기'
//         }
//       ],
//       tag: payload.tag || 'default',
//       requireInteraction: true, // 사용자가 직접 닫을 때까지 유지
//     };

//     event.waitUntil(
//       self.registration.showNotification(
//         payload.title || '알림',
//         notificationOptions
//       )
//     );
//   } catch (error) {
//     console.error('푸시 메시지 처리 중 오류:', error);
//     // 기본 알림 표시
//     event.waitUntil(
//       self.registration.showNotification('알림', {
//         body: '새로운 메시지가 있습니다',
//         icon: '/ucube-symbol-color.png'
//       })
//     );
//   }
// });

// // 알림 클릭 처리
// self.addEventListener('notificationclick', (event) => {
//   console.log('알림 클릭됨:', event);

//   event.notification.close();

//   const action = event.action;
//   const notificationData = event.notification.data || {};

//   if (action === 'close') {
//     return; // 그냥 닫기만 함
//   }

//   // 'open' 액션이거나 알림 본체 클릭
//   const urlToOpen = notificationData.url || '/';

//   event.waitUntil(
//     clients.matchAll({ type: 'window', includeUncontrolled: true })
//       .then((clientList) => {
//         // 이미 열린 창이 있으면 그 창으로 이동
//         for (let i = 0; i < clientList.length; i++) {
//           const client = clientList[i];
//           if (client.url.includes(self.location.origin)) {
//             client.navigate(urlToOpen);
//             return client.focus();
//           }
//         }
//         // 열린 창이 없으면 새 창 열기
//         return clients.openWindow(urlToOpen);
//       })
//   );
// });
