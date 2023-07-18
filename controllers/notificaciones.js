const { express, response } = require('express');
const { connection } = require("../database/configdbMysql");
const Notificaciones = require('../models/notificaciones');
require('dotenv').config(); // para las variables globales
const { v4: uuidv4 } = require('uuid');
const { actualizarBD } = require('../helpers/actualizarbd');
const fs = require('fs');
const Usuario = require('../models/usuarios');
const { infoToken } = require('../helpers/infotoken');

const crearContactoForm = async(req, res = response) => {
    const { asunto, email, mensaje, ...object } = req.body;
    const currentDate = new Date();
    const options2 = { timeZone: 'Europe/Madrid', hour12: false };
    const madridTime = currentDate.toLocaleString('en-US', options2);
    const [date, time] = madridTime.split(', ');

    const [month, day, year] = date.split('/');
    const mysqlFormattedTime = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${time}`;
    console.log("Recibido", asunto);
    connection.query(`INSERT INTO delt4.notificaciones (asunto,email,mensaje,time) VALUES ('${asunto}','${email}','${mensaje}','${mysqlFormattedTime}')`, function(error) { // NO EXISTE CONNECT
        if (error) {
            throw error;
        } else {
            console.log('Conexion correcta.');
            res.json({
                ok: true,
                msg: 'notificacion enviada',
            });
        }
    });
}

const getContactoForm = async(req, res = response) => {
    connection.query(`SELECT * FROM delt4.notificaciones ORDER BY time DESC`, function(error, result) { // NO EXISTE CONNECT
        if (error) {
            throw error;
        } else {

            res.json({
                ok: true,
                msg: 'getContactoForm',
                result
            });
        }
    });
}

const crearValoracion = async(req, res = response) => {

    const { comentario, puntuacion, ...object } = req.body;
    const uid = req.params.id;


    try {

        const token = req.header('x-token');

        // lo puede actualizar un administrador o el propio usuario del token
        if (!((infoToken(token).rol === 'ROL_ADMIN') || (infoToken(token).uid === uid))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para valorar',
            });
        }

        const usuarioBD = await Usuario.findById(uid);
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario incorrecto',
            });
        }
        console.log('Paso 2');
        ////GUARDAR LA VALORACION------------------------------------------------------------------------
        const currentDate = new Date();
        const options2 = { timeZone: 'Europe/Madrid', hour12: false };
        const madridTime = currentDate.toLocaleString('en-US', options2);
        const [date, time] = madridTime.split(', ');

        const [month, day, year] = date.split('/');
        const mysqlFormattedTime = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${time}`;
        console.log('Paso 3');

        console.log('Estos son los valores a insertar 2', uid, puntuacion, comentario, mysqlFormattedTime);

        connection.query(`INSERT INTO valoraciones (uid,valor,mensaje,time) VALUES ('${uid}','${puntuacion}','${comentario}','${mysqlFormattedTime}')`, function(error) { // NO EXISTE CONNECT
            if (error) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error en valoracion'
                });
            } else {

            }
        });
        console.log('usuario antes de val: ', usuarioBD);
        usuarioBD.Valoracion = true;

        console.log('usuario despues de val: ', usuarioBD);
        await usuarioBD.save();

        res.json({
            ok: true,
            msg: 'Valoracion hecha'
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: 'Error al valorar',
        });
    }

}


module.exports = { crearContactoForm, getContactoForm, crearValoracion }