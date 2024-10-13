let selectedRegion = { x: 0, y: 0, width: 100, height: 100 };

// Depuración: Verificar que la página está cargada
console.log('Renderer.js cargado.');

// Asegúrate de que la API de Electron esté disponible
if (window.electronAPI) {
    console.log('API de Electron encontrada.');

    document.getElementById('select-region-button').addEventListener('click', () =>
    {
        console.log('Botón de seleccionar región presionado.');
        window.electronAPI.send('open-selection-window'); // Usar la API expuesta
    });

    document.getElementById('scan-button').addEventListener('click', async () =>
    {
        const { x, y, width, height } = selectedRegion;
        console.log('Iniciando escaneo con región:', selectedRegion);

        try {
            const result = await window.electronAPI.scanScreen(x, y, width, height);
            document.getElementById('result').innerText = `Resultado: ${result}`;
            console.log('Número detectado:', result);
        } catch (err) {
            console.error('Error al escanear pantalla:', err);
        }
    });

    window.electronAPI.on('region-selected', (region) =>
    {
        console.log('Región seleccionada:', region);
        selectedRegion = region;
    });
} else {
    console.error('La API de Electron no está disponible.');
}
