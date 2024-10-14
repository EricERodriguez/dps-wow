const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const screenshot = require('screenshot-desktop');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs');

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
    if (selectionWindow) return;

    const { width, height } = require('electron').screen.getPrimaryDisplay().size;

    selectionWindow = new BrowserWindow({
        width,
        height,
        frame: false, // Sin bordes
        transparent: true, // Ventana transparente
        alwaysOnTop: true, // Siempre al frente
        skipTaskbar: true, // Ocultar de la barra de tareas
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
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

ipcMain.handle('scan-screen', async (event, region) =>
{
    try {
        console.log('Iniciando escaneo con región:', region);

        // Captura de toda la pantalla
        const imgBuffer = await screenshot({ screen: 0, format: 'png' });

        // Recorte de la región seleccionada usando sharp
        const croppedBuffer = await sharp(imgBuffer)
            .extract({
                left: region.x,
                top: region.y,
                width: region.width,
                height: region.height
            })
            .toBuffer();

        // Guarda la imagen recortada para verificar
        fs.writeFileSync('captura_procesada.png', croppedBuffer);
        console.log('Imagen recortada guardada como captura_procesada.png');

        // Realiza OCR en la imagen recortada
        const { data: { text } } = await Tesseract.recognize(croppedBuffer, 'spa', {
            logger: (m) => console.log(m),
        });

        console.log('Texto detectado:', text);
        return text;
    } catch (error) {
        console.error('Error al escanear pantalla:', error);
        throw error;
    }
});

app.on('window-all-closed', () =>
{
    if (process.platform !== 'darwin') app.quit();
});
