const Usuario = require('../models/usuarios');
const fs = require('fs');

const actualizarBD = async(tipo, path, nombreArchivo, id) => {

    switch (tipo) { //aqui en caso de que sea una evidencia (diseños subidos por estudios) o una foto de perfil
        case 'fotoperfil':
            const usuario = await Usuario.findById(id);
            if (!usuario) {
                return false;
            }
            const fotovieja = usuario.imagen;
            const pathFotoVieja = `${path}/${fotovieja}`;
            if (fotovieja && fs.existsSync(pathFotoVieja)) { //comprobamos si existe una foto anterior y la elminamos si es el caso
                fs.unlinkSync(pathFotoVieja);
            }
            usuario.imagen = nombreArchivo;
            await usuario.save();
            return true;
            break;

        case 'publicacion':
            const usuario2 = await Usuario.findById(id);
            if (!usuario2) {
                return false;
            }
            if (usuario2.rol !== 'ROL_ESTUDIO') {
                return false;
            }

            return true;
            break;

        default:
            return false;
            break;
    }
}

module.exports = { actualizarBD }