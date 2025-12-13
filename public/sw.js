// Service Worker placeholder
// This file prevents 404 errors for sw.js requests
// The portfolio does not use a service worker, but some browser extensions request it

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    // Do nothing - this is a placeholder
});
