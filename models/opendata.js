const { Schema, model } = require('mongoose');

const OpenDataSchema = Schema({
    titulo: {
        type: String,
    },
    parte_cuerpo: {
        type: [{
            type: String
        }]
    },
    estilo: {
        type: [{
            type: String
        }]
    },
    descripcion: {
        type: String,
    },
    fecha_creacion: {
        type: String,
    }
}, { collection: 'opendataTattoo' });
OpenDataSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.uid = _id;
    return object;
})
module.exports = model('Opendata', OpenDataSchema);