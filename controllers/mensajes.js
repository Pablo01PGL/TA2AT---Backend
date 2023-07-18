const { express, response } = require('express');
const { connection } = require("../database/configdbMysql");
const Mensajes = require('../models/mensajes');
require('dotenv').config(); // para las variables globales
const { v4: uuidv4 } = require('uuid');
const { actualizarBD } = require('../helpers/actualizarbd');
const { infoToken } = require('../helpers/infotoken');
const fs = require('fs');

const crearMensajeForm = async(req, res = response) => {
    try {
        const { remitente, destinatario, mensaje, ...object } = req.body;
        const currentDate = new Date();
        const options2 = { timeZone: 'Europe/Madrid', hour12: false };
        const madridTime = currentDate.toLocaleString('en-US', options2);
        const [date, time] = madridTime.split(', ');

        const [month, day, year] = date.split('/');
        const mysqlFormattedTime = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${time}`;

        connection.query(`INSERT INTO delt4.mensajes (remitente,destinatario,mensaje,fecha) VALUES ('${remitente}','${destinatario}','${mensaje}','${mysqlFormattedTime}')`, function(error) { // NO EXISTE CONNECT
            if (error) {
                return res.status(400).json({
                    ok: false,
                    msg: 'No tiene permisos para listar usuarios',
                    error: error
                });
            } else {
                console.log('Conexion correcta.');
                res.json({
                    ok: true,
                    msg: 'getMensajeForm',
                });
                // console.log('La hora es: '+ currentDate.getHours()+':'+currentDate.getMinutes());
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando mensajes'
        });
    }
}

const actualizarMensajeForm = async(req, res = response) => {
    try {

        //comprobar token con uid
        const uid = req.body.uid;
        const token = req.header('x-token');
        if (!(infoToken(token).uid === uid)) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar usuarios',
            });
        }



        const ids = req.body.ids;

        let Cquery = `UPDATE delt4.mensajes set leido = true where `;

        for (let index = 0; index < ids.length; index++) {
            if (index != 0) {
                Cquery = Cquery + ` or id = ${ids[index]}`;
            } else {
                Cquery = Cquery + `id = ${ids[index]}`;
            }
        }

        connection.query(Cquery, function(error) { // NO EXISTE CONNECT
            if (error) {
                return res.status(400).json({
                    ok: false,
                    msg: 'No tiene permisos para listar usuarios',
                    error: error
                });
            } else {
                console.log('Conexion correcta.');
                res.json({
                    ok: true,
                    msg: 'UpdateMensajeForm',
                });
                // console.log('La hora es: '+ currentDate.getHours()+':'+currentDate.getMinutes());
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error Actulaizando mensajes'
        });
    }
}

const getMensajeForm = async(req, res = response) => { //Meter comprobocacion de token en el futuro
    try {
        const remitente = req.query.uid;
        //comprobar token con uid
        const token = req.header('x-token');
        if (!(infoToken(token).uid === remitente)) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para listar usuarios',
            });
        }

        connection.query(`SELECT * FROM mensajes WHERE remitente = '${remitente}' or destinatario = '${remitente}' ORDER BY fecha ASC `, function(error, result) { // NO EXISTE CONNECT
            if (error) {
                console.log(error);
                return res.status(400).json({
                    ok: false,
                    msg: 'No tiene permisos para listar usuarios',
                    error: error
                });
            } else {

                res.json({
                    ok: true,
                    msg: 'getMensajeForm',
                    result
                });

            }
            // console-log("REsult:",result);
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error obteniendo mensajes'
        });
    }
}


module.exports = { crearMensajeForm, actualizarMensajeForm, getMensajeForm }