const fs = require('fs');
const readline = require('readline');

class LectorArchivos {
    async leerNumeros(ruta) {
        const numeros = new Set();
        const flujoLectura = fs.createReadStream(ruta);
        const rl = readline.createInterface({
            input: flujoLectura,
            crlfDelay: Infinity
        });

        for await (const linea of rl) {
            // Limpiamos la línea de cualquier carácter que no sea numérico
            const limpio = linea.replace(/[^0-9]/g, '');
            if (limpio && limpio.length > 5) {
                numeros.add(limpio);
            }
        }
        return Array.from(numeros);
    }
}

module.exports = LectorArchivos;
