class SiguienteContactoDTO {
    constructor(data) {
        this.validacionId = data.validacionId;
        this.contactoId = data.contactoId;
        this.telefono = data.telefono;
        this.nombre = data.nombre;
    }
}
module.exports = SiguienteContactoDTO;
