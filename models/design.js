const { Schema, model } = require('mongoose');

const DesignSchema = Schema({
    nombre: {
        type: String,
        require: true
    },
    color: {
        type: Boolean,
        require: true
    },
    estilos: {
        type: [{
            type: String
        }],
        require: true
    },
    zonas: {
        type: [{
            type: String
        }],
        require: true
    },
    descripcion: {
        type: String,
        require: true
    },
    imagen_id: {
        type: String,
        require: true
    },
    imagen_x: {
        type: Number,
        require: true
    },
    imagen_y: {
        type: Number,
        require: true
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
        require: true
    },
    autor: {
        type: String,
        require: true
    },
    guardados: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "Usuario",
        }]
    }

}, { collection: 'design' });
DesignSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.did = _id;
    return object;
})

module.exports = model('Design', DesignSchema);