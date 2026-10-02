const axios = require('axios');
const SiguienteContactoDTO = require('../dtos/SiguienteContactoDTO');

class ApiCliente {
    constructor() {
        this.baseUrl = process.env.API_URL || 'http://localhost:3000/api';
        this.clienteId = process.env.CLIENTE_ID;
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'X-API-KEY': process.env.API_KEY,
                'X-API-SECRET': process.env.API_SECRET,
                'X-CLIENTE-ID': this.clienteId
            },
            validateStatus: () => true // Para manejar errores manualmente
        });
    }

    async obtenerSiguienteContacto() {
        try {
            const response = await this.client.post('/validaciones/siguiente');
            if (response.status === 200 && response.data.exito && response.data.datos) {
                return new SiguienteContactoDTO(response.data.datos);
            }
            return null;
        } catch (error) {
            console.error('[API] Error obteniendo siguiente contacto:', error.message);
            return null;
        }
    }

    async reportarResultado(validacionId, respuestaDTO) {
        try {
            const response = await this.client.post(`/validaciones/${validacionId}/resultado`, respuestaDTO);
            return response.status === 200 && response.data.exito;
        } catch (error) {
            console.error(`[API] Error reportando resultado para ${validacionId}:`, error.message);
            return false;
        }
    }

    async enviarLatido() {
        try {
            const response = await this.client.post(`/clientes/${this.clienteId}/latido`);
            return response.status === 200;
        } catch (error) {
            console.error('[API] Error enviando latido:', error.message);
            return false;
        }
    }

    async obtenerEstadisticas() {
        try {
            const response = await this.client.get('/estadisticas');
            if (response.status === 200 && response.data.exito && response.data.datos) {
                return response.data.datos;
            }
            return null;
        } catch (error) {
            // Silencioso para no romper la UI en consola si hay un fallo temporal
            return null;
        }
    }
}

module.exports = ApiCliente;
