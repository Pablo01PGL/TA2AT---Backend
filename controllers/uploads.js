const { response } = require('express');
require('dotenv').config(); // para las variables globales
const { v4: uuidv4 } = require('uuid');
const { actualizarBD } = require('../helpers/actualizarbd');
const fs = require('fs');
//const { Ng2ImgMaxService } = require('ng2-img-max'); //libreria compresion

const subirArchivo = async(req, res = repsonse) => { //V

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            msg: 'No se ha subido el archivo'
        });
    }

    if (req.files.archivo.truncated) {
        return res.status(400).json({
            ok: false,
            msg: `El archivo es demasiado grande, permitido hasta ${process.env.MAXSIZEUPLOAD}MB`
        });
    }

    const tipo = req.params.tipo; // Tipo puede ser foto de perfil o texto si hace falta
    const id = req.params.id;

    const archivosValidos = { // extensiones que vamos a admitir
        fotoperfil: ['jpeg', 'jpg', 'png'],
        //publicacion: ['doc', 'docx', 'xls', 'pdf', 'zip'],
        publicacion: ['jpeg', 'jpg', 'png'],
    }

    //validacion que el archivo es de su extension
    const archivo = req.files.archivo;
    const nombrePartido = archivo.name.split('.');
    const extension = nombrePartido[nombrePartido.length - 1]; // con esto consigo la extension verdadera de lo que nos pasan por si lleva puntos el nombre del archivo


    switch (tipo) { //switch donde comprobamos el tipo de archivo que estamos tratando, si es unba foto de perfil o un diseño
        case 'fotoperfil':
            if (!archivosValidos.fotoperfil.includes(extension)) {
                return res.status(400).json({
                    ok: false,
                    msg: `El tipo de archivo ${extension} no está permitido. Si permitidos: (${archivosValidos.fotoperfil}) `,
                });
            }
            break;
        case 'publicacion':
            if (!archivosValidos.publicacion.includes(extension)) {
                return res.status(400).json({
                    ok: false,
                    msg: `El tipo de archivo ${extension} no está permitido. Si permitidos: (${archivosValidos.publicacion}) `,
                });
            }
            break;

        default:
            return res.status(400).json({
                ok: false,
                msg: `Esta operacion no está permitida`,
                tipoOperacion: tipo
            });
            break;
    }
    //COMPRESION DE LA IMAGEN



    //DONDE SE GUARDARÁ LA IMAGEN
    const path = `${process.env.PATHUPLOAD}/${tipo}`;
    const nombreArchivo = `${uuidv4()}.${extension}`;
    const patharchivo = `${path}/${nombreArchivo}`; //ruta con nombre de archivo donde se enviará el archivo

    archivo.mv(patharchivo, (err) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                msg: `No se pudo cargar el archivo`,
                tipoOperacion: tipo
            });
        }
        actualizarBD(tipo, path, nombreArchivo, id)
            .then(valor => {
                if (!valor) {
                    fs.unlinkSync(patharchivo); //esto lo hago para que si da error se borre la imagen y no se suba
                    return res.status(400).json({
                        ok: false,
                        msg: `No se pudo actualizar BD`,
                    });
                } else {
                    res.json({
                        ok: true,
                        msg: 'subirArchivo',
                        nombreArchivo
                    });
                }
            }).catch(error => {
                fs.unlinkSync(patharchivo);
                return res.status(400).json({
                    ok: false,
                    msg: `Error al cargar archivo`,
                });
            });
    });
}

const enviarArchivo = async(req, res = repsonse) => { //V
    //Comprobar que el que hace la llamda es la persona que subió el diseño o un admin




    //

    const tipo = req.params.tipo;
    const nombreArchivo = req.params.nombreArchivo;

    const path = `${process.env.PATHUPLOAD}/${tipo}`;
    pathArchivo = `${path}/${nombreArchivo}`;

    if (!fs.existsSync(pathArchivo)) { // si no existe el path del archivo
        /*
        if (tipo !== 'fotoperfil') {
            return res.status(400).json({
                ok: false,
                msg: 'Archivo no existe',

            });
        }
        pathArchivo = `${process.env.PATHUPLOAD}/fotoperfil/no-imagen.jpg`;
        */
        switch (tipo) { //switch donde comprobamos el tipo de archivo que estamos tratando, si es unba foto de perfil o un diseño
            case 'fotoperfil':
                pathArchivo = `${process.env.PATHUPLOAD}/${tipo}/no-imagen.jpg`;
                break;
            case 'publicacion':
                pathArchivo = `${process.env.PATHUPLOAD}/${tipo}/error.png`;
                break;
            default:
                return res.status(400).json({
                    ok: false,
                    msg: `El tipo de archivo es erroneo`,
                    tipoOperacion: tipo
                });
                break;
        }
    }
    res.sendFile(pathArchivo);
}

const borrarArchivo = async(req, res = response) => {
    const nombreArchivo = req.params.id;
    const tipo = req.params.tipo;
    try {
        // Comprobamos si existe el archivo que queremos borrar
        const path = `${process.env.PATHUPLOAD}/${tipo}`;
        const pathArchivo = `${path}/${nombreArchivo}`;
        if (!fs.existsSync(pathArchivo)) { // si no existe el path del archivo
            return res.status(400).json({
                ok: false,
                msg: 'Archivo no existe',

            });
        }
        // Lo eliminamos y devolvemos el usuaurio recien eliminado
        fs.unlink(pathArchivo, (err) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error al eliminar archivo',
                });
            }
        });

        //actualizamos la base de datos?


        res.json({
            ok: true,
            msg: 'Design eliminado',
            resultado: resultado
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error eliminando archivo'
        });
    }
}


module.exports = { subirArchivo, enviarArchivo, borrarArchivo }