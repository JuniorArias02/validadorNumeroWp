class ValidarListaNumeros {
    constructor(lectorArchivos, escritorResultados, servicioWhatsApp, gestorHistorial) {
        this.lectorArchivos = lectorArchivos;
        this.escritorResultados = escritorResultados;
        this.servicioWhatsApp = servicioWhatsApp;
        this.gestorHistorial = gestorHistorial;
        this.LIMITE_POR_SESION = 20;
    }

    async ejecutar(rutaArchivoEntrada) {
        const numerosCompletos = await this.lectorArchivos.leerNumeros(rutaArchivoEntrada);
        
        // Filtramos los que ya están en el historial
        const numerosPendientes = numerosCompletos.filter(num => !this.gestorHistorial.fueProcesado(num));

        if (numerosPendientes.length === 0) {
            console.log(`No hay números nuevos por procesar en: ${rutaArchivoEntrada}`);
            return;
        }

        // Tomamos máximo 20
        const numerosAProcesar = numerosPendientes.slice(0, this.LIMITE_POR_SESION);

        console.log(`De ${numerosCompletos.length} números, ${numerosPendientes.length} son nuevos.`);
        console.log(`Iniciando la validación del lote de ${numerosAProcesar.length} números...`);
        
        await this.servicioWhatsApp.iniciar();

        for (let i = 0; i < numerosAProcesar.length; i++) {
            const numeroActual = numerosAProcesar[i];
            console.log(`\n--- [${i + 1}/${numerosAProcesar.length}] Validando: ${numeroActual} ---`);
            
            try {
                const tieneWhatsApp = await this.servicioWhatsApp.validarNumero(numeroActual);
                
                if (tieneWhatsApp === 'DISPONIBLE') {
                    console.log(`${numeroActual} SÍ.`);
                } else if (tieneWhatsApp === 'NO_DISPONIBLE') {
                    console.log(`${numeroActual} NO.`);
                } else if (tieneWhatsApp === 'ERROR') {
                    console.log(`Estado desconocido para ${numeroActual} (Timeout).`);
                }

                this.escritorResultados.guardarResultado(numeroActual, tieneWhatsApp);
                this.gestorHistorial.registrarNumero(numeroActual, tieneWhatsApp);
                
                // Pausamos para no sobrecargar la web (5 a 10 segundos)
                const pausaAleatoriaMs = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
                console.log(`Pausa de seguridad de ${(pausaAleatoriaMs / 1000).toFixed(1)} segundos...`);
                await this.servicioWhatsApp.esperarPausaEntrePeticiones(pausaAleatoriaMs);

            } catch (error) {
                console.error(`DETENCIÓN DE EMERGENCIA procesando ${numeroActual}: ${error.message}`);
                console.log('Abortando la sesión actual por seguridad...');
                break; // Rompemos el ciclo y salimos limpiamente
            }
        }

        console.log('\nProceso de validación completado con éxito (Lote finalizado).');
        await this.servicioWhatsApp.cerrar();
    }
}

module.exports = ValidarListaNumeros;
