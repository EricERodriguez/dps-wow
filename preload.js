console.log('Preload script cargado correctamente.');
const { contextBridge, ipcRenderer } = require('electron');

// Exponer la API al contexto de la ventana del renderizado
contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel, data) =>
    {
        const validChannels = ['open-selection-window', 'region-selected'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    on: (channel, callback) =>
    {
        const validChannels = ['region-selected'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => callback(...args));
        }
    },
    scanScreen: (x, y, width, height) =>
    {
        return ipcRenderer.invoke('scan-screen', { x, y, width, height });
    }
});
