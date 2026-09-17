const fs = require('fs');
const path = require('path');

class EscritorResultados {
    constructor(rutaArchivoSalida) {
        this.rutaArchivoSalida = rutaArchivoSalida;
        this.inicializarArchivo();
    }

    inicializarArchivo() {
        const dir = path.dirname(this.rutaArchivoSalida);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(this.rutaArchivoSalida)) {
            fs.writeFileSync(this.rutaArchivoSalida, 'Numero,Tiene WhatsApp\n');
        }
    }

    guardarResultado(numero, tieneWhatsApp) {
        fs.appendFileSync(this.rutaArchivoSalida, `${numero},${tieneWhatsApp}\n`);
    }

    guardarError(numero, mensaje) {
        fs.appendFileSync(this.rutaArchivoSalida, `${numero},error\n`);
    }
}

module.exports = EscritorResultados;
