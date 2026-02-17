const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('speedtrackDesktop', {
  platform: process.platform,
});
