const chalk = require('chalk');
const logUpdate = require('log-update');

class UiConsola {
    constructor() {
        this.estado = 'Iniciando...';
        this.numeroActual = 'Ninguno';
        this.cliente = process.env.CLIENTE_ID || 'CLIENTE-001';
        
        this.estadisticas = {
            total: 'N/A',
            procesados: 0,
            pendientes: 'N/A',
            conWhatsapp: 0,
            sinWhatsapp: 0,
            errores: 0,
            progreso: 0
        };

        this.inicio = Date.now();
        this.ultimoProcesados = 0;
        this.ultimaVelocidad = 0;
    }

    actualizarEstado(nuevoEstado, numero = null) {
        this.estado = nuevoEstado;
        if (numero) {
            this.numeroActual = numero;
        }
        this.render();
    }

    actualizarDesdeApi(datos) {
        if (!datos) return;

        this.estadisticas = {
            total: datos.contactos.total,
            procesados: datos.contactos.completados + (datos.contactos.errores || 0),
            pendientes: datos.contactos.pendientes,
            conWhatsapp: datos.whatsapp.conWhatsapp,
            sinWhatsapp: datos.whatsapp.sinWhatsapp,
            errores: datos.contactos.errores || 0,
            progreso: datos.progreso || 0
        };

        this.render();
    }

    _generarBarraProgreso(porcentaje) {
        const longitudBarra = 24; // longitud de la barra
        const bloquesLlenos = Math.round((porcentaje / 100) * longitudBarra);
        const bloquesVacios = longitudBarra - bloquesLlenos;
        
        const barraLlena = '█'.repeat(Math.max(0, bloquesLlenos));
        const barraVacia = '░'.repeat(Math.max(0, bloquesVacios));
        
        return `${chalk.green(barraLlena)}${chalk.gray(barraVacia)}  ${porcentaje.toFixed(1)}%`;
    }

    render() {
        const { total, procesados, pendientes, conWhatsapp, sinWhatsapp, errores, progreso } = this.estadisticas;
        
        // Calcular velocidad (contactos por minuto promedio desde el inicio, o de los últimos X minutos)
        // Haremos un cálculo simple desde el inicio
        const minutosTranscurridos = (Date.now() - this.inicio) / 60000;
        let velocidad = 0;
        if (minutosTranscurridos > 0.05) { // Esperar un poquito para no dar infinito
            velocidad = Math.round(procesados / minutosTranscurridos);
        }
        
        // Calcular ETA
        let etaFormateado = 'Calculando...';
        if (velocidad > 0 && typeof pendientes === 'number') {
            const minutosRestantes = Math.ceil(pendientes / velocidad);
            etaFormateado = `${minutosRestantes} min`;
        } else if (pendientes === 0 && procesados > 0) {
            etaFormateado = 'Completado';
        }
        
        const ui = `
${chalk.blue.bold('╔══════════════════════════════════════════╗')}
${chalk.blue.bold('║       VALIDADOR DE CONTACTOS             ║')}
${chalk.blue.bold('╚══════════════════════════════════════════╝')}

  Estado       ● ${this.estado}
  Contacto     ● ${chalk.yellow(this.numeroActual)}
  Cliente      ${chalk.cyan(this.cliente)}

  ${chalk.bold('CONTACTOS')}
  ${chalk.gray('────────────────────────────────────────')}
  Total                    ${total.toLocaleString('es-CO')}
  Procesados               ${procesados.toLocaleString('es-CO')}
  Pendientes               ${pendientes.toLocaleString('es-CO')}

  ${chalk.bold('RESULTADOS')}
  ${chalk.gray('────────────────────────────────────────')}
  ${chalk.green('✓ Con WhatsApp')}           ${conWhatsapp.toLocaleString('es-CO')}
  ${chalk.red('✕ Sin WhatsApp')}             ${sinWhatsapp.toLocaleString('es-CO')}
  ${chalk.yellow('⚠ Errores')}                   ${errores.toLocaleString('es-CO')}

  ${chalk.bold('PROGRESO')}
  ${this._generarBarraProgreso(progreso)}

  Velocidad                 ${velocidad} contactos/min
  Tiempo estimado           ${etaFormateado}

  ${chalk.dim('[CTRL+C] Detener')}
`;
        logUpdate(ui);
    }
}

module.exports = UiConsola;
