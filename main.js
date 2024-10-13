const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let selectionWindow;

function createMainWindow()
{
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: false,
        }
    });

    mainWindow.loadFile('index.html');
}

function createSelectionWindow()
{
    if (selectionWindow) return; // Evitar múltiples instancias

    selectionWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false, // Sin marco para mejorar la selección
        transparent: true, // Ventana transparente
        parent: mainWindow, // Asegurar que sea modal
        modal: true, // Definir como modal
        alwaysOnTop: true, // Mantener ventana al frente
        webPreferences: {
            nodeIntegration: true, // Permitir `require` en la ventana
            contextIsolation: false, // Deshabilitar aislamiento para esta ventana
        }
    });

    selectionWindow.loadFile('selection.html');

    selectionWindow.on('closed', () =>
    {
        selectionWindow = null;
    });
}

app.whenReady().then(createMainWindow);

ipcMain.on('open-selection-window', () =>
{
    console.log('Evento recibido: open-selection-window');
    createSelectionWindow();
});

ipcMain.on('region-selected', (event, region) =>
{
    console.log('Región seleccionada recibida:', region);
    mainWindow.webContents.send('region-selected', region);
});

app.on('window-all-closed', () =>
{
    if (process.platform !== 'darwin') app.quit();
});
