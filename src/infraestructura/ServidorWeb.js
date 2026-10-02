const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

class ServidorWeb {
    constructor(gestorHistorial, puerto = process.env.PORT || 3598) {
        this.app = express();
        this.puerto = puerto;
        this.gestorHistorial = gestorHistorial;
        this.servidor = null;

        this._configurarRutas();
    }

    _configurarRutas() {
        // Servir archivos estáticos
        this.app.use(express.static(path.join(__dirname, '..', 'public')));

        // Endpoint para la vista principal de monitoreo
        this.app.get('/estadoContactos', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'public', 'estadoContactos.html'));
        });

        // Endpoint API para obtener las métricas en tiempo real
        this.app.get('/api/metricas', (req, res) => {
            const metricas = this.gestorHistorial.obtenerMetricas();
            res.json(metricas);
        });
    }

    iniciar() {
        return new Promise((resolve) => {
            this.servidor = this.app.listen(this.puerto, () => {
                console.log(`[Servidor Web] Dashboard local disponible en: http://localhost:${this.puerto}/estadoContactos`);
                this._iniciarTunnel();
                resolve();
            });
        });
    }

    _iniciarTunnel() {
        console.log('[Cloudflare Tunnel] Iniciando túnel seguro...');
        
        const tunnel = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${this.puerto}`]);
        
        tunnel.stderr.on('data', (data) => {
            const texto = data.toString();
            // Buscar la URL de trycloudflare en los logs del proceso
            const match = texto.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
            
            if (match) {
                console.log('\n======================================================');
                console.log(' \x1b[32mDASHBOARD PÚBLICO EN VIVO\x1b[0m');
                console.log(` \x1b[36m${match[0]}/estadoContactos\x1b[0m`);
                console.log('======================================================\n');
            }
        });

        tunnel.on('error', (err) => {
            console.log(`[Cloudflare Tunnel] Nota: No se pudo iniciar el túnel automáticamente (${err.message}). ¿Tienes cloudflared instalado?`);
        });

        this.tunnelProcess = tunnel;
    }

    detener() {
        if (this.servidor) {
            this.servidor.close();
        }
        if (this.tunnelProcess) {
            this.tunnelProcess.kill();
        }
    }
}

module.exports = ServidorWeb;
