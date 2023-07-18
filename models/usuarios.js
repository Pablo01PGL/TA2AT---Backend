const { Schema, model } = require('mongoose');

const UsuarioSchema = Schema({
    nombre_estudio: {
        type: String,
    },
    nombre_usuario: {
        type: String,
    },
    nombre: {
        type: String,
        //required: true
    },
    apellidos: {
        type: String,
        //required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    CIF: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'UNVERIFIED'
    },
    imagen: {
        type: String
    },
    fnacimiento: {
        type: Date
    },
    rol: {
        type: String,
        required: true,
        default: 'ROL_USUARIO'
    },
    tour: {
        type: Boolean,
        default: false
    },
    alta: {
        type: Date,
        default: Date.now
    },
    activo: {
        type: Boolean,
        default: true
    },
    Cuenta_de_Google: {
        type: Boolean,
        default: false
    },
    imagenGoogle: {
        type: Boolean,
        default: true
    },
    Valoracion: {
        type: Boolean,
        default: false
    },
    Pais: {
        type: String,
    },
    Ciudad: {
        type: String,
    },
    avatar: {
        type: Schema.Types.ObjectId,
        ref: 'Avatar'
    },
    guardados: [{ //lista de tatuajes guardados en favoritos
        design: {
            type: Schema.Types.ObjectId,
            ref: 'design'
        }
    }],
}, { collection: 'usuarios' });

UsuarioSchema.method('toJSON', function() { //esto transforma el password en uid y sobreescribe el metodo json para cambiarlo y asi jamas devoler el password por el frontend
    const { __v, _id, password, ...object } = this.toObject();
    object.uid = _id;
    return object;
})

module.exports = model('Usuario', UsuarioSchema);