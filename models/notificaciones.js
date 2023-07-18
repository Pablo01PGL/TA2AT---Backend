const { Schema, model } = require('mongoose');

const NotificacionesSchema = Schema({
    nombre: {
        type: String,
        require: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mensaje: {
        type: String,
        require: true
    }
}, { collection: 'notificaciones' });
NotificacionesSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.uid = _id;
    return object;
})
module.exports = model('Notificaciones', NotificacionesSchema);