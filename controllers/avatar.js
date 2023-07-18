const { response } = require('express');
const Avatar = require('../models/avatar');
const design = require('../models/design');
const { addLog } = require('../helpers/logs');

const obtenerAvatar = async(req, res = response) => { //V
    console.log('Obtener avatar()', req.query.id);
    // Paginación

    const id = req.query.id;
    try {
        let avatar, total;

        if (id) {
            [avatar, total] = await Promise.all([
                // Avatar.findById(id).populate('tatuajes'),
                Avatar.findOne({ usuario: id }).populate('tatuajes'),
                Avatar.countDocuments()
            ]);
            if (!avatar) {
                res.status(400).json({
                    ok: false,
                    msg: 'Este usuario no tiene ningún avatar asignado',
                });
                return;
            }
        } else {
            [avatar, total] = await Promise.all([
                Avatar.find().populate('tatuajes'),
                Avatar.countDocuments()
            ]);
        }
        // console.log('tatuajes obtenidos: ', avatar.tatuajes);
        // addLog(avatar._id, 'informativo', 'Obtener avatar',
        //     `El avatar con id ${avatar._id} ha sido obtenido`);

        res.status(200).json({
            ok: true,
            msg: 'Avatar obtenido',
            avatar,
            total
        });

    } catch (error) {
        console.log(error);
        addLog(null, 'error', 'Obtener avatar',
            `Error al obtener avatar`);
        return res.status(400).json({
            ok: false,
            msg: 'Error al obtener avatar'
        });
    }
}

const crearAvatar = async(req, res = response) => { //V
    console.log('Crear avatar()');
    const usuario = String(req.body.usuario).trim();
    const tatuajes = req.body.tatuajes;
    const piel = req.body.piel;
    const modelo = req.body.modelo;
    const object = {
        usuario: usuario,
        tatuajes: tatuajes,
        piel: piel,
        modelo: modelo
    }
    console.log('Avatar a crear: ', object)

    try {
        // Comprobamos que no tenga otro avatar asignado el usuario
        const existeAvatar = await Avatar.findOne({ usuario: usuario });
        if (existeAvatar) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario ya tiene avatar'
            });
        }
        const avatar = new Avatar(req.body);
        avatar.usuario = usuario;

        await avatar.save();

        res.status(200).json({
            ok: true,
            msg: 'Avatar creado',
            avatar,
        });
    } catch (error) {
        console.log(error);
        addLog(null, 'informativo', 'Crear avatar',
            `Error creando avatar`);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando avatar'
        });
    }
}

const actualizarAvatar = async(req, res) => { //M
    console.log('Actualizar avatar()');
    const usuario = String(req.body.usuario).trim();
    const object = req.body;
    console.log('Avatar a actualizar: ', object)
    try {

        // const avatar = await Avatar.findByIdAndUpdate(uid, object, { new: true });
        const avatar = await Avatar.findOneAndUpdate({ usuario: usuario }, object, { new: true })

        // addLog(avatar._id, 'informativo', 'Actualizar avatar',
        //     `El usuario ${avatar.usuario} ha actualizado un avatar`);

        res.json({
            ok: true,
            msg: 'Avatar actualizado',
            object
        });
    } catch (error) {
        console.log(error);
        addLog(null, 'informativo', 'Crear avatar',
            `Error actualizando avatar`);
        return res.status(400).json({
            ok: false,
            msg: 'Error actualizando avatar'
        });
    }
}

const borrarAvatar = async(req, res = response) => {
    const uid = req.query.id;
    try {
        // Comprobamos si existe el usuario que queremos borrar
        const existeAvatar = await Avatar.findById(uid);
        if (!existeAvatar) {
            return res.status(400).json({
                ok: true,
                msg: 'El avatar no existe'
            });
        }
        // Lo eliminamos y devolvemos el usuaurio recien eliminado
        const resultado = await Avatar.findByIdAndRemove(uid);
        addLog(uid, 'informativo', 'Borrar avatar',
            `El usuario ${resultado} ha borrado un avatar`);
        res.json({
            ok: true,
            msg: 'Avatar eliminado',
            resultado: resultado
        });
    } catch (error) {
        console.log(error);
        addLog(uid, 'informativo', 'Borrar avatar',
            `Error borrando avatar`);
        return res.status(400).json({
            ok: false,
            msg: 'Error borrando avatar'
        });
    }
}

module.exports = { obtenerAvatar, crearAvatar, actualizarAvatar, borrarAvatar }