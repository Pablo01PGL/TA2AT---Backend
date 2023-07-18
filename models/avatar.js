const { Schema, model } = require('mongoose');

const AvatarSchema = Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
        require: true
    },
    modelo: {
        type: String,
        require: true
    },
    piel: {
        type: String,
        require: true
    },
    tatuajes: [{ //lista tatuajes
        datos: {
            type: Object,
        },
        position: {
            type: Object,
            default: { x: 0, y: 0, z: 0 },
        },
        orientation: {
            type: Object,
        },
        escala: {
            type: Number,
        },
        colorsito: {
            type: String,
        },
        oculto: {
            type: Boolean,
        },
    }]
}, { collection: 'avatar' });
AvatarSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.aid = _id;
    return object;
})

module.exports = model('Avatar', AvatarSchema);