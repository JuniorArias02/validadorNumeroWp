require('dotenv').config();
const path = require('path');
const ServicioWhatsAppNavegador = require('./infraestructura/ServicioWhatsAppNavegador');
const ApiCliente = require('./infraestructura/ApiCliente');
const UiConsola = require('./presentacion/UiConsola');
const ValidarContactoApi = require('./casos_de_uso/ValidarContactoApi');

const RUTA_SESION = path.join(__dirname, '..', 'wpp_session');

async function iniciarAplicacion() {
    // 1. Inicializamos infraestructura
    const apiCliente = new ApiCliente();
    const servicioWhatsApp = new ServicioWhatsAppNavegador(RUTA_SESION);
    const uiConsola = new UiConsola();

    // 2. Inicializamos el caso de uso inyectando dependencias
    const validadorApiUseCase = new ValidarContactoApi(apiCliente, servicioWhatsApp, uiConsola);

    // Capturar la interrupción (CTRL+C)
    process.on('SIGINT', async () => {
        uiConsola.actualizarEstado('Deteniendo...');
        validadorApiUseCase.detener();
        setTimeout(() => {
            process.exit(0);
        }, 2000);
    });

    // 3. Ejecutamos el caso de uso
    uiConsola.render();
    await validadorApiUseCase.ejecutar();
}

iniciarAplicacion().catch(error => {
    console.error('\nError crítico en la aplicación:', error);
    process.exit(1);
});
