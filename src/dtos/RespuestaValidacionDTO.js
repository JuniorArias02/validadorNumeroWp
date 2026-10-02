class RespuestaValidacionDTO {
    /**
     * @param {string} estado - 'completado'
     * @param {string} estadoWhatsapp - 'activo', 'inactivo', 'invalido', 'desconocido'
     * @param {any} raw - Datos brutos (opcional)
     */
    constructor(estado, estadoWhatsapp, raw = null) {
        this.estado = estado;
        this.estadoWhatsapp = estadoWhatsapp;
        this.respuesta = {
            raw: raw
        };
    }
}
module.exports = RespuestaValidacionDTO;
