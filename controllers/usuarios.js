const Usuario = require('../models/usuarios');
const Avatar = require('../models/avatar');
const { addData } = require('../helpers/mysqlInsert');
const validator = require('validator'); //codigo de validar datos de posts
const bcrypt = require('bcryptjs');
const { infoToken } = require('../helpers/infotoken');
const mongoose = require('mongoose');

const obtenerUsuario = async(req, res) => { //async permite esperar a que terminen de cargar los elementos asincronos

    const desde = Number(req.query.desde) || 0; // El number transforma en un numero lo que venga en la variable
    const registropp = Number(process.env.DOCSPERPAGE);

    const texto = req.query.texto;
    let textoBusqueda = '';
    if (texto) {
        textoBusqueda = new RegExp(texto, 'i');
        //console.log('texto', texto, ' textoBusqueda', textoBusqueda);
    }

    //Obtenemos el id de un usuario por si solo queremos buscar uno
    const id = req.query.id || '';
    console.log('texto: ', textoBusqueda);
    try {

        // Solo puede listar usuarios un admin
        const token = req.header('x-token');
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === id))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar usuarios',
            });
        }

        let usuarios, total;
        if (id) {
            // Promesas funciones que se declaran y se ejecutan al mismo tiempo y hasta que no acaben las dos no se termina
            // Esto se usa para no tener que hacer dos llamadas a la base de datos. abajo dejo el codigo de como quedarí si lo hicieramos en varias llamadas (sin promesa)

            [usuarios, total] = await Promise.all([
                Usuario.findById(id).populate('avatar'), // El populate hace que nos de toda la informacion del avatar. No solo su id.
                Usuario.countDocuments()
            ]);

        } else {
            if (texto) {
                [usuarios, total] = await Promise.all([
                    Usuario.find({ $or: [{ nombre: textoBusqueda }, { apellidos: textoBusqueda }, { email: textoBusqueda }] }).skip(desde).limit(registropp),
                    Usuario.countDocuments({ $or: [{ nombre: textoBusqueda }, { apellidos: textoBusqueda }, { email: textoBusqueda }] })
                ]);
            } else {
                [usuarios, total] = await Promise.all([
                    Usuario.find({}).skip(desde).limit(registropp).populate('avatar'),
                    Usuario.countDocuments()
                ]);
            }
        }


        res.json({ // Añado informacion de la paginacion
            ok: true,
            msg: 'getUsuarios',
            usuarios,
            page: {
                desde,
                registropp,
                total
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo usuario'
        });
    }
}


const obtenerUsuariosChat = async(req, res) => { //async permite esperar a que terminen de cargar los elementos asincronos

    const id = req.query.id || '';

    try {

        let ListaUsuarios = [];

        const nUsuarios = req.query['nUsuarios'];

        for (let index = 0; index < nUsuarios; index++) {
            //ListaUsuarios.push(req.query[`${index}`])
            const userId = req.query[`${index}`];
            if (mongoose.isValidObjectId(userId)) {
                ListaUsuarios.push(mongoose.Types.ObjectId(userId));
            }
        }

        const consulta = { _id: { $in: ListaUsuarios } };

        let usuarios, total;
        [usuarios, total] = await Promise.all([
            Usuario.find(consulta).select('_id nombre imagen'),
            Usuario.countDocuments()
        ]);

        res.json({ // Añado informacion de la paginacion
            ok: true,
            msg: 'getUsuarios',
            usuarios,
            total
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo usuario'
        });
    }
}


const existeEmail = async(req, res) => { //async permite esperar a que terminen de cargar los elementos asincronos

    //Obtenemos el id de un usuario por si solo queremos buscar uno
    const emailC = req.params.email;
    try {
        const exiteEmail = await Usuario.findOne({ email: emailC });
        if (exiteEmail) {
            res.json({
                ok: false,
                msg: 'Email ya existe',
                existe: true
            });
        } else {
            res.json({
                ok: true,
                msg: 'getUsuarios',
                existe: false
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo usuario'
        });
    }
}

const crearUsuario = async(req, res) => {

    const { email, password, rol } = req.body; //const { email, password, ...objeto } = req.body; Si usara este codig, el resto de cosas que nos da el body se guardaría en objetos
    try {
        // Solo puede crear usuarios un admin
        const token = req.header('x-token');
        // lo puede actualizar un administrador o el propio usuario del token
        if (!(infoToken(token).rol === 'ROL_ADMIN')) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para crear usuarios',
            });
        }

        const exiteEmail = await Usuario.findOne({ email: email }); //comprobar que no existe un usuario con el email enviado en nuestra base de datos
        if (exiteEmail) {
            return res.status(400).json({
                ok: false,
                msg: 'Email ya existe' // hay que intentar dar la minima informacion cuando salen errores para que la gente no sepa si hay alguine registrado
            });
        }

        //////AQUI ABAJO cifrar contraseña
        const salt = bcrypt.genSaltSync(); // generamos un salt, una cadena aleatoria
        const cpassword = bcrypt.hashSync(password, salt); // y aquí ciframos la contraseña


        // Vamos a tomar todo lo que nos llega por el req.body excepto el alta, ya que la fecha de alta se va a signar automáticamente en BD. Esto es por si acaso nos intentan colar una fecha de alta falsa.
        const { alta, ...object } = req.body;

        //Almacenar en la base de datos

        const usuario = new Usuario(req.body);

        usuario.password = cpassword;
        console.log("LLega a crearlo");
        await usuario.save(); //await porque tarda un tiempom en crearse


        res.json({
            ok: true,
            msg: 'crearUsuarios',
            usuario
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando usuario'
        });
    }

}

const actualizarUsuario = async(req, res = response) => {
    // Asegurarnos de que aunque venga el password no se va a actualizar, la modificaciñon del password es otra llamada
    // Comprobar que si cambia el email no existe ya en BD, si no existe puede cambiarlo
    const { password, alta, email, activo, ...object } = req.body;
    const uid = req.params.id;

    try {
        // Para actualizar usuario o eres admin o eres usuario del token y el uid que nos llega es el mismo
        const token = req.header('x-token');
        if (!(infoToken(token).rol === 'ROL_ADMIN' || infoToken(token).uid === uid)) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no tiene permisos para actualizar este perfil'
            });
        }

        // Comprobar si está intentando cambiar el email, que no coincida con alguno que ya esté en BD
        // Obtenemos si hay un usuaruio en BD con el email que nos llega en post
        const existeEmail = await Usuario.findOne({ email: email });

        if (existeEmail) {
            // Si existe un usuario con ese email
            // Comprobamos que sea el suyo, el UID ha de ser igual, si no el email est en uso
            if (existeEmail._id != uid) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Email ya existe'
                });
            }
        }

        // Comprobar si existe el usuario que queremos actualizar
        const existeUsuario = await Usuario.findById(uid);

        if (!existeUsuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe'
            });
        }
        // llegadoa aquí el email o es el mismo o no está en BD, es obligatorio que siempre llegue un email
        object.email = email;

        // Si el rol es de administrador, entonces si en los datos venía el campo activo lo dejamos
        if ((infoToken(token).rol === 'ROL_ADMIN') /*&& activo*/ ) {
            object.activo = activo;
        }

        // al haber extraido password del req.body nunca se va a enviar en este put
        const usuario = await Usuario.findByIdAndUpdate(uid, object, { new: true });

        res.json({
            ok: true,
            msg: 'Usuario actualizado',
            usuario: usuario
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error actualizando usuario'
        });
    }

}

const actualizarPassword = async(req, res = response) => {

    const uid = req.params.id;
    const { password, nuevopassword, nuevopassword2 } = req.body;

    try {
        const token = req.header('x-token');
        // lo puede actualizar un administrador o el propio usuario del token
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uid))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para actualizar contraseña',
            });
        }

        const usuarioBD = await Usuario.findById(uid);
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario incorrecto',
            });
        }

        const validPassword = bcrypt.compareSync(password, usuarioBD.password);
        // Si es el el usuario del token el que trata de cambiar la contraseña, se comprueba que sabe la contraseña vieja y que ha puesto 
        // dos veces la contraseña nueva
        if (infoToken(token).uid === uid) {

            if (nuevopassword !== nuevopassword2) {
                return res.status(400).json({
                    ok: false,
                    msg: 'La contraseña repetida no coincide con la nueva contraseña',
                });
            }

            if (!validPassword) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Contraseña incorrecta',
                    token: ''
                });
            }
        }

        // tenemos todo OK, ciframos la nueva contraseña y la actualizamos
        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(nuevopassword, salt);
        usuarioBD.password = cpassword;

        // Almacenar en BD
        await usuarioBD.save();

        res.json({
            ok: true,
            msg: 'Contraseña actualizada'
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: 'Error al actualizar contraseña',
        });
    }


}

const borrarUsuario = async(req, res) => {

    const uid = req.params.id;

    try {

        // Solo puede borrar usuarios un admin
        const token = req.header('x-token');

        if (!(infoToken(token).rol === 'ROL_ADMIN')) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para borrar usuarios',
            });
        }

        // No me puedo borrar a mi mismo
        if ((infoToken(token).uid === uid)) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no puede eliminarse a si mismo',
            });
        }
        // Comprobar si existe el usuario que queremos borrar
        const existeUsuario = await Usuario.findById(uid);
        if (!existeUsuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe det'
            });
        }
        // Lo eliminamos y devolvemos el usuario
        const resultado = await Usuario.findByIdAndRemove(uid);

        res.json({
            ok: true,
            msg: 'Usuario eliminado',
            resultado: resultado
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error borrando usuario'
        });
    }

}

const actualizarTour = async(req, res) => {
    const uid = req.params.id;
    const tour = req.body;
    console.log(uid);
    console.log(tour);
    try {
        const usuarioBD = await Usuario.findById(uid);
        console.log("1");
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario incorrecto',
            });
        }

        console.log("2");
        usuarioBD.tour = tour.tour;

        // Almacenar en BD
        await usuarioBD.save();
        console.log("3");
        console.log(usuarioBD.tour);
        res.json({
            ok: true,
            msg: 'Tour realizado'
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: 'Error al actualizar la variable tour',
        });
    }
}

module.exports = {
        obtenerUsuario,
        existeEmail,
        crearUsuario,
        actualizarUsuario,
        borrarUsuario,
        actualizarPassword,
        actualizarTour,
        obtenerUsuariosChat,
        actualizarTour
    } //aqui exporto las funciones para que puedan ser utilizables desde fuera