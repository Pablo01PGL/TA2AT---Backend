const { Schema, model } = require('mongoose');

const MensajesSchema = Schema({
    remitente: {
        type: String,
        require: true
    },
    destinatario: {
        type: String,
        required: true
    },
    mensaje: {
        type: [{
            type: String
        }],
        require: true
    }
}, { collection: 'mensajes' });
MensajesSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.uid = _id;
    return object;
})
module.exports = model('Mensajes', MensajesSchema);