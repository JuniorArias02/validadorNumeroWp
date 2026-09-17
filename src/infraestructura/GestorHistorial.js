const fs = require('fs');
const path = require('path');

class GestorHistorial {
    constructor(rutaArchivoHistorial) {
        this.rutaArchivoHistorial = rutaArchivoHistorial;
        this.historial = this._cargarHistorial();
    }

    _cargarHistorial() {
        if (fs.existsSync(this.rutaArchivoHistorial)) {
            try {
                const contenido = fs.readFileSync(this.rutaArchivoHistorial, 'utf-8');
                return JSON.parse(contenido);
            } catch (error) {
                console.warn('Advertencia: No se pudo leer el archivo de historial JSON. Se iniciará uno nuevo.');
                return {};
            }
        }
        return {};
    }

    _guardarHistorial() {
        try {
            const dir = path.dirname(this.rutaArchivoHistorial);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.rutaArchivoHistorial, JSON.stringify(this.historial, null, 2), 'utf-8');
        } catch (error) {
            console.error('Error guardando el historial:', error);
        }
    }

    fueProcesado(numero) {
        return this.historial.hasOwnProperty(numero);
    }

    registrarNumero(numero, estado) {
        // Solo guardamos si es DISPONIBLE o NO_DISPONIBLE.
        // Si es ERROR por un bloqueo o timeout temporal, preferimos no registrarlo para poder reintentar luego.
        // (Opcionalmente, se podría registrar el error pero la regla dice que los errores no se deben contabilizar como "sin WhatsApp")
        if (estado === 'DISPONIBLE' || estado === 'NO_DISPONIBLE') {
            this.historial[numero] = estado;
            this._guardarHistorial();
        }
    }
}

module.exports = GestorHistorial;
