// Service Worker for H7 Admin Push Notifications

self.addEventListener('push', (event) => {
  let data = { title: 'New Order!', body: 'You have a new order.' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/H7-site-icon.png',
      badge: '/H7-site-icon.png',
      tag: 'new-order',
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: '/admin/orders' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/admin';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
