const { response } = require('express');
const { addLog } = require('../helpers/logs');
const { addData } = require('../helpers/mysqlInsert');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuarios');
const { generarJWT } = require('../helpers/jwt');
const jwt = require('jsonwebtoken');
const { getTemplate, sendEmail, sendEmailRecovery, getTemplateRecovery } = require('../helpers/mail');
const { infoToken } = require("../helpers/infotoken");
const Avatar = require('../models/avatar');


const token = async(req, res = response) => { //esto lo utilizamos para que cada vez que hagamos un post se nos renueve el token para seguir usando la app
    const token = req.headers['x-token'];

    try {
        const { uid, rol, ...object } = jwt.verify(token, process.env.JWTSECRET); //este proceso ya se uso en validar token en middleware
        const usuarioBD = await Usuario.findById(uid);
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Token no válido 1',
                token: ''
            });
        }

        var Gacount = false;
        var imagenGoogle = true;
        if (usuarioBD.Cuenta_de_Google) {
            if (usuarioBD.Cuenta_de_Google === true) {
                Gacount = true;
            }
        }

        const nrol = usuarioBD.rol;

        const nuevotoken = await generarJWT(uid, rol);

        res.json({
            ok: true,
            msg: 'Token válido',
            uid: uid,
            nombre: usuarioBD.nombre,
            apellidos: usuarioBD.apellidos,
            email: usuarioBD.email,
            rol: nrol,
            tour: usuarioBD.tour,
            alta: usuarioBD.alta,
            activo: usuarioBD.activo,
            imagen: usuarioBD.imagen,
            //fnacimiento: usuarioBD.fnacimiento,
            token: nuevotoken,
            Gacount: Gacount,
            imagenGoogle: imagenGoogle,
            Valoracion: usuarioBD.Valoracion,
        });
    } catch {
        return res.status(400).json({
            ok: false,
            msg: 'Token no válido',
            token: ' '
        });
    }
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

const login = async(req, res = response) => {

    const { email, password } = req.body; //sacamos el email y password que nos dan
    try {
        const usuarioBD = await Usuario.findOne({ email }); //podemos usar ususario aqui porque lo hemos importado arriba de models ususario

        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        if (usuarioBD.Cuenta_de_Google) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }


        const validPassword = bcrypt.compareSync(password, usuarioBD.password); // aqui comprobamos la si la contraseña introducida es igual a la existente en la base de datos. En casod e que si devuelve true.
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        if (usuarioBD.status == 'UNVERIFIED') {
            return res.status(400).json({
                ok: false,
                msg: 'Lo siento, no podemos iniciar sesión en este momento. Por favor, verifique su cuenta antes de intentar iniciar sesión',
                token: ''
            });
        }

        var Gacount = false;
        if (usuarioBD.Cuenta_de_Google) {
            if (usuarioBD.Cuenta_de_Google === true) {
                Gacount = true;
            }
        }

        const { _id, rol } = usuarioBD;
        const token = await generarJWT(usuarioBD._id, usuarioBD.rol); // Se pone _id porque así se llama en la BD. Se puede mirar en mongo para comprobar.

        //ESTO ES EL LOG   uid,tipo,accion,descripcion
        console.log('este es el log: ', usuarioBD._id, usuarioBD.email);
        addLog(usuarioBD._id, 'informativo', 'login',
            `El usuario con correo ${usuarioBD.email} ha iniciado sesion`);

        res.json({
            ok: true,
            msg: 'login',
            uid: _id,
            nombre: usuarioBD.nombre,
            apellidos: usuarioBD.apellidos,
            email: usuarioBD.email,
            rol,
            tour: usuarioBD.tour,
            alta: usuarioBD.alta,
            activo: usuarioBD.activo,
            //fnacimiento: usuarioBD.fnacimiento,
            imagen: usuarioBD.imagen,
            Gacount: Gacount,
            Valoracion: usuarioBD.Valoracion,
            token
        });

    } catch (error) {
        console.log(error);
        // addLog(usu._id, 'error', 'login',
        //     `El usuario con correo ${usu.email} ha iniciado sesion`);
        return res.status(400).json({
            ok: false,
            msg: 'Error en login',
            token: ''
        });
    }
}

const sendRecovery = async(req, res = response) => {

    const { email } = req.body; //sacamos el email que nos dan

    try {
        const usuarioBD = await Usuario.findOne({ email }); //podemos usar ususario aqui porque lo hemos importado arriba de models ususario
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo que has puesto no se encuentra registrado en nuestra aplicacion',
                token: ''
            });
        }

        const token = await generarJWT(usuarioBD._id, usuarioBD.rol);
        console.log('este es el token ', token)

        const template = getTemplateRecovery(email, token);
        console.log("COGER PLANTILLA");

        await sendEmailRecovery(email, 'Recuperacion cuenta', template);

        res.json({
            ok: true,
            msg: 'Todo bien'
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error ',
            token: ''
        });
    }
}

const recaccount = async(req, res = response) => {

    try {
        console.log("reccacount 1")
        const token = req.headers['x-token'];

        const { password, password2 } = req.body;

        const uid = infoToken(token).uid;

        console.log("reccacount 1.2")


        const usuarioBD = await Usuario.findById(uid);
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario incorrecto',
            });
        }
        console.log("reccacount 2")


        if (password !== password2) {
            return res.status(400).json({
                ok: false,
                msg: 'La contraseña repetida no coincide con la nueva contraseña',
            });
        }

        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(password, salt);
        usuarioBD.password = cpassword;
        console.log("reccacount 3")
            // Almacenar en BD
        await usuarioBD.save();
        console.log("reccacount 4")
        res.json({
            ok: true,
            msg: 'Cuenta recuperada'
        });



    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: 'Error al recuperar usuario',
        });
    }


}


const register = async(req, res = response) => {
    const { email, password, fnacimiento, rol, usu, nombre_estudio } = req.body;

    if (rol === 'ROL_USUARIO' || rol === 'ROL_ESTUDIO') {
        try {
            const exiteEmail = await Usuario.findOne({ email: email });
            if (exiteEmail) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Email ya existe'
                });
            }

            const salt = bcrypt.genSaltSync();
            const cpassword = bcrypt.hashSync(password, salt);

            const { alta, ...object } = req.body;

            const usuario = new Usuario(req.body);
            delete usuario.avatar;

            if (rol === 'ROL_USUARIO') { //AFINAR ESTO MAS TARDE
                usuario.CIF = "";
                //const fecha = new Date(fnacimiento);
                //usuario.fnacimiento = fecha;
                usuario.nombre_usuario = usu;
            } else if (rol === 'ROL_ESTUDIO') {
                usuario.nombre_estudio = nombre_estudio;
            }

            usuario.Cuenta_de_Google = false;

            usuario.password = cpassword;
            console.log("LLega hasta aqui1111111111111111111111111111111111111111");
            addData(usuario, 'usuarios'); //NO VA
            await usuario.save();
            //console.log('el usuario recien creado:', usuario)

            const nuevoUsuario = await Usuario.findOne({ email: email });
            //console.log('el nuevo recien creado:', nuevoUsuario._id)

            let avatarPayload = {
                usuario: nuevoUsuario._id,
                modelo: "./assets/humano/chico.glb", // Por defecto, el modelo del hombre
                piel: "#e9caae", // Por defecto, el color blanco
                tatuajes: [],
            }
            const avatar = new Avatar(avatarPayload);
            console.log("avatar=", avatar);
            // avatar.usuario = nuevoUsuario._id;
            await avatar.save();

            const token = await generarJWT(nuevoUsuario._id, nuevoUsuario.rol);
            //console.log('este es el token ', token);
            const template = getTemplate(email, token);
            //console.log("COGER PLANTILLA");
            await sendEmail(email, 'Confirmación de registro', template);
            //console.log("EMAIL ENVIADO");

            usuario.password = "?????????";
            if (rol === 'ROL_USUARIO') {
                addLog(usuario._id, 'informativo', 'registro',
                    `El usuario con correo ${usuario.email} se ha registrado`);
            } else if (rol === 'ROL_ESTUDIO') {
                addLog(usuario._id, 'informativo', 'registro',
                    `El estudio ${usuario.nombre_estudio} se ha registrado`);
            }

            res.json({
                ok: true,
                msg: 'Usuario registrado con exito',
                usuario
            });

        } catch (error) {
            const usuario = new Usuario(req.body);
            console.log("LLega hasta aqui2222222222222222222222222222222222222222222222222");
            console.log(error);
            addLog(usuario._id, 'error', 'registro',
                `El usuario con correo ${usuario.email} se ha registrado`);
            return res.status(400).json({

                ok: false,
                msg: 'Error creando usuario'
            });
        }
    }
}

const confirmarUsuario = async(req, res) => {
    try {

        const token = req.params.token;

        const uid = infoToken(token).uid;
        //console.log('uid:', token)
        const user = await Usuario.findById(uid);
        //console.log("user voy a save=", user);
        //console.log('********************antes de save****************************************')

        //console.log("save=", user);
        if (user === null) {
            return res.json({
                success: false,
                msg: 'Usuario no existe'
            });
        }

        // Actualizar usuario
        user.status = 'VERIFIED';
        //console.log('********************estado****************************************')
        //console.log("estado=", user.status);

        const obj = { status: 'VERIFIED' }
        const usuario = await Usuario.findByIdAndUpdate(uid, obj, { new: true });

        //await user.save();
        //console.log("Se ha hecho", user);
        //console.log("usuario=", usuario);

        return res.redirect('https://ta2at.ovh/verificacion');
        /*res.json({
            ok: true,
            msg: 'Usuario verificado',
            usuario: usuario
        });*/

    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            msg: 'Error al confirmar usuario'
        });
    }
}


const RGoogle = async(req, res = response) => {
    //req.body como null
    console.log("Soy RGoogle " + response + " " + req + " " + req.body);
    const { email } = req.body;

    try {

        const exiteEmail = await Usuario.findOne({ email: email });
        if (exiteEmail) {
            console.log("Soy RGoogle y fallo en 'exiteEmail'");
            return res.status(400).json({
                ok: false,
                msg: 'Email ya existe'
            });
        }
        //const { alta, nombre_estudio, nombre_usuario, CIF, password, rol, activo, Cuenta_de_Google, avatar, nombre, imagen, photoUrl, firstName, lastName ...object } = req.body;
        const { photoUrl, firstName, lastName, name, rol, cif, usu, foto, fnacimiento, ...object } = req.body;


        const usuario = new Usuario();
        if (rol === 'ROL_USUARIO') {
            usuario.email = email;
            usuario.nombre_usuario = usu;
            usuario.nombre = firstName;
            usuario.apellidos = lastName;
            usuario.Cuenta_de_Google = true;
            usuario.imagen = foto;
            usuario.fnacimiento = fnacimiento;
            usuario.rol = rol;
            usuario.password = "Default";
            usuario.status = "VERIFIED";
        } else if (rol === 'ROL_ESTUDIO') {
            usuario.email = email;
            usuario.nombre_estudio = usu;
            usuario.cif = cif;
            usuario.Cuenta_de_Google = true;
            usuario.imagen = foto;
            usuario.rol = rol;
            usuario.password = "Default";
            usuario.fnacimiento = fnacimiento;
            usuario.nombre = firstName;
            usuario.apellidos = lastName;
            usuario.status = "VERIFIED";
        }


        await usuario.save();


        //Aqui creo el avatar FALTA PONER QUE DE QUE EN CASO DE QUE HAYA ALGUN ERROR
        const nuevoUsuario = await Usuario.findOne({ email: email });

        const avatar = new Avatar(req.body.avatar);
        console.log("avatar=", avatar);
        avatar.usuario = nuevoUsuario._id;
        await avatar.save();

        res.json({
            ok: true,
            msg: 'Usuario registrado con exito',
            usuario
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false
        });

    }
}

const RGoogleNew = async(req, res = response) => {
    //req.body como null
    console.log("Soy RGoogle " + response + " " + req + " " + req.body);
    const { email } = req.body;

    try {
        const { photoUrl, firstName, lastName, name, ...object } = req.body;

        const usuario = new Usuario();

        usuario.email = email;
        usuario.nombre_usuario = name;
        usuario.nombre = firstName;
        usuario.apellidos = lastName;
        usuario.Cuenta_de_Google = true;
        usuario.imagen = photoUrl;
        usuario.rol = "ROL_USUARIO";
        usuario.password = "Default";

        await usuario.save();

        const nuevoUsuario = await Usuario.findOne({ email: usuario.email });
        //console.log('el nuevo recien creado:', nuevoUsuario._id)

        //const token = await generarJWT(nuevoUsuario._id, nuevoUsuario.rol);
        //const template = getTemplate(email, token);
        //await sendEmail(email, 'Confirmación de registro', template);

        res.json({
            ok: true,
            msg: 'Usuario registrado con exito',
            usuario
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false
                /*,
                            msg: 'Ha habido un error con el usuario de Google'*/
        });

    }
}

const LGoogle = async(req, res = response) => {
    const { email } = req.body; //sacamos el email

    try {
        /*Con esa comprobacion se quita el login bueno*/
        /* if (!email) {*/
        const usuarioBD = await Usuario.findOne({ email });

        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        /*Con esto crashea, pero seria necesario registrar el email
        Falla el req.body RGoogle();*/

        const { _id, rol, Cuenta_de_Google } = usuarioBD;
        // && usuarioBD.status == 'VERIFIED'
        if (usuarioBD.Cuenta_de_Google) {
            const token = await generarJWT(usuarioBD._id, usuarioBD.rol);
            console.log('LGOOGLE HECHO');
            res.json({
                ok: true,
                msg: 'login',
                uid: _id,
                rol,
                Cuenta_de_Google,
                token
            });
        } else if (!usuarioBD.Cuenta_de_Google) {
            console.log('LLEGO A ERROR');
            return res.status(400).json({
                ok: false,
                msg: 'Su cuenta no está enlazada con google, inicie sesión de otra forma.',
                token: ''
            });
        }
        addLog(usuarioBD._id, 'informativo', 'Login Google',
            `El usuario con correo ${usuarioBD.email} se ha logeado con su cuenta de google`);
        /*} else {
            RGoogle(email);
        }*/

    } catch (error) {
        console.log(error);
        addLog(usuarioBD._id, 'error', 'Login Google',
            `El usuario con correo ${usuarioBD.email} se ha logeado con su cuenta de google`);
        return res.status(400).json({
            ok: false,
            msg: 'Error en login',
            token: ''
        });
    }
}

module.exports = { login, token, register, RGoogle, LGoogle, confirmarUsuario, sendRecovery, recaccount }