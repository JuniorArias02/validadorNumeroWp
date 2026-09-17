const path = require('path');
const LectorArchivos = require('./infraestructura/LectorArchivos');
const EscritorResultados = require('./infraestructura/EscritorResultados');
const ServicioWhatsAppNavegador = require('./infraestructura/ServicioWhatsAppNavegador');
const GestorHistorial = require('./infraestructura/GestorHistorial');
const ValidarListaNumeros = require('./casos_de_uso/ValidarListaNumeros');

// Configuración de rutas
const RUTA_SALIDA = path.join(__dirname, '..', 'salida');
const ARCHIVO_ENTRADA = process.argv[2] || path.join(__dirname, '..', 'numeros.txt');
const ARCHIVO_SALIDA = path.join(RUTA_SALIDA, 'resultados.csv');
const RUTA_SESION = path.join(__dirname, '..', 'wpp_session');
const ARCHIVO_HISTORIAL = path.join(RUTA_SALIDA, 'procesados.json');

async function iniciarAplicacion() {
    console.log('Iniciando Validador de Números de WhatsApp...\n');

    // Inicializamos infraestructura
    const lector = new LectorArchivos();
    const escritor = new EscritorResultados(ARCHIVO_SALIDA);
    const servicioWhatsApp = new ServicioWhatsAppNavegador(RUTA_SESION);
    const gestorHistorial = new GestorHistorial(ARCHIVO_HISTORIAL);

    // Inicializamos el caso de uso inyectando dependencias
    const validadorUseCase = new ValidarListaNumeros(lector, escritor, servicioWhatsApp, gestorHistorial);

    // Ejecutamos
    await validadorUseCase.ejecutar(ARCHIVO_ENTRADA);
}

iniciarAplicacion().catch(error => {
    console.error('Error crítico en la aplicación:', error);
    process.exit(1);
});
