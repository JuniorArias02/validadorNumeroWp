const RespuestaValidacionDTO = require('../dtos/RespuestaValidacionDTO');

class ValidarContactoApi {
    constructor(apiCliente, servicioWhatsApp, uiConsola) {
        this.apiCliente = apiCliente;
        this.servicioWhatsApp = servicioWhatsApp;
        this.uiConsola = uiConsola;
        this.corriendo = true;
    }

    _esFormatoValido(numero) {
        const regex = /^\d{10}$/;
        return regex.test(numero);
    }

    async iniciarLatido() {
        setInterval(async () => {
            if (this.corriendo) {
                await this.apiCliente.enviarLatido();
            }
        }, 60000); // Latido cada minuto
    }

    async iniciarActualizacionEstadisticas() {
        setInterval(async () => {
            if (this.corriendo) {
                const datos = await this.apiCliente.obtenerEstadisticas();
                if (datos) {
                    this.uiConsola.actualizarDesdeApi(datos);
                }
            }
        }, 2500); // Actualizar UI cada 2.5 segundos
    }

    async ejecutar() {
        this.uiConsola.actualizarEstado('Conectando a WhatsApp...');
        await this.servicioWhatsApp.iniciar();
        this.uiConsola.actualizarEstado('WhatsApp conectado. Iniciando servicios...');
        this.iniciarLatido();
        this.iniciarActualizacionEstadisticas();

        while (this.corriendo) {
            this.uiConsola.actualizarEstado('Buscando siguiente contacto...');
            const contacto = await this.apiCliente.obtenerSiguienteContacto();

            if (!contacto) {
                this.uiConsola.actualizarEstado('Esperando trabajo (cola vacía)...');
                await this.esperar(10000); // Esperar 10 segundos antes de preguntar de nuevo
                continue;
            }

            this.uiConsola.actualizarEstado(`Validando...`, contacto.telefono);

            let estadoWhatsappResult = 'desconocido';

            if (!this._esFormatoValido(contacto.telefono.replace('57', ''))) { // Ajuste por si viene con '57'
                estadoWhatsappResult = 'invalido';
            } else {
                try {
                    const tieneWhatsApp = await this.servicioWhatsApp.validarNumero(contacto.telefono);
                    if (tieneWhatsApp === 'DISPONIBLE') {
                        estadoWhatsappResult = 'activo';
                    } else if (tieneWhatsApp === 'NO_DISPONIBLE') {
                        estadoWhatsappResult = 'inactivo';
                    }
                } catch (error) {
                    estadoWhatsappResult = 'desconocido';
                }
            }

            const respuesta = new RespuestaValidacionDTO('completado', estadoWhatsappResult);
            await this.apiCliente.reportarResultado(contacto.validacionId, respuesta);

            // Pausa de seguridad (5 a 10 segundos)
            const pausaAleatoriaMs = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
            this.uiConsola.actualizarEstado(`Pausa de seguridad...`);
            await this.esperar(pausaAleatoriaMs);
        }
    }

    esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    detener() {
        this.corriendo = false;
        this.servicioWhatsApp.cerrar();
    }
}

module.exports = ValidarContactoApi;
