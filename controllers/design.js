const { response } = require('express');
const Designs = require('../models/design');
const Usuario = require('../models/usuarios');
const { addLog } = require('../helpers/logs');
const { addData, updateData } = require('../helpers/mysqlInsert');
const { infoToken } = require('../helpers/infotoken');
require('dotenv').config(); // para las variables globales
const { v4: uuidv4 } = require('uuid');
const { actualizarBD } = require('../helpers/actualizarbd');
const fs = require('fs');


const obtenerDesign = async(req, res) => {
    // Paginación
    const desde = Number(req.query.desde) || 0;
    const registropp = Number(process.env.DOCSPERPAGE);

    const uid = req.query.uid || '';

    const Color = req.query.Color;
    const Estilos = req.query.Estilos;
    const Zonas = req.query.Zonas;

    let filtros = {};



    const texto = req.query.texto;
    let textoBusqueda = '';
    if (texto) {
        textoBusqueda = new RegExp(texto, 'i');
        //console.log('texto', texto, ' textoBusqueda', textoBusqueda);
        filtros = { //Añadimos a los filtros el texto en caso de que exista para hacer la llamada de forma mas facil
            $or: [
                { nombre: textoBusqueda }, //El campo de options "i" hace quye al buscar por el txto no distinga entre mayusculas y minusculas
                { descripcion: textoBusqueda }
            ]
        };
    }
    if (Color) {
        if (Color === 'Blanco y Negro')
            filtros.color = { $eq: false };
        else
            filtros.color = { $eq: true };
    }
    if (Estilos) {
        if (Estilos.length > 0)
            filtros.estilos = { $in: Estilos };
    }
    if (Zonas) {
        if (Zonas.length > 0)
            filtros.zonas = { $in: Zonas };
    }

    //Lo que obtenemos al pasar un id (siendo siempre de diseño) es ese diseño en caso de que exista
    const did = req.query.id || '';
    //console.log('texto: ', textoBusqueda);
    try {
        let design, total;
        if (did) {
            // Promesas funciones que se declaran y se ejecutan al mismo tiempo y hasta que no acaben las dos no se termina
            // Esto se usa para no tener que hacer dos llamadas a la base de datos. abajo dejo el codigo de como quedarí si lo hicieramos en varias llamadas (sin promesa)

            [design, total] = await Promise.all([
                Designs.findById(did),
                Designs.countDocuments()
            ]);

        } else if (uid) { //ESTO SIGNIFICA QUE SI PASAMOS POR PARAMETRO EL ID DE UN USUARIO SOLO SE MOSTRARÁN DISEÑOS SUYOS

            if (texto) {
                [design, total] = await Promise.all([
                    //en el futuro si hago filtrar por estudios cambiar guardados por estudios
                    Designs.find({ $and: [{ usuario: uid }, { $or: [{ nombre: textoBusqueda }, { descripcion: textoBusqueda }] }] }).skip(desde).limit(registropp),
                    Designs.countDocuments({ $and: [{ usuario: uid }, { $or: [{ nombre: textoBusqueda }, { descripcion: textoBusqueda }] }] })
                ]);
            } else {
                [design, total] = await Promise.all([
                    Designs.find({ $or: [{ usuario: uid }] }).skip(desde).limit(registropp),
                    Designs.countDocuments({ $or: [{ usuario: uid }] })
                ]);
            }
        } else {
            [design, total] = await Promise.all([
                Designs.find(filtros).skip(desde).limit(registropp),
                Designs.countDocuments(filtros)
            ]);
        }

        res.json({
            ok: true,
            msg: 'obtenerDesign',
            design,
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
            msg: 'Error al obtener design'
        });
    }
}


const obtenerGuardados = async(req, res) => {

    const desde = Number(req.query.desde) || 0;
    const registropp = Number(process.env.DOCSPERPAGE);

    const uid = req.query.uid || '';

    const Color = req.query.Color;
    console.log('filtro 1: ', Color);
    const Estilos = req.query.Estilos;
    console.log('filtro 2: ', Estilos);
    const Zonas = req.query.Zonas;
    console.log('filtro 3: ', Zonas);

    let filtros = {
        $and: [
            { guardados: uid }
        ]
    };



    const texto = req.query.texto;
    let textoBusqueda = '';
    if (texto) {
        textoBusqueda = new RegExp(texto, 'i');
        //console.log('texto', texto, ' textoBusqueda', textoBusqueda);
        filtros = { //Añadimos a los filtros el texto en caso de que exista para hacer la llamada de forma mas facil
            $and: [
                { guardados: uid },
                {
                    $or: [
                        { nombre: textoBusqueda },
                        { descripcion: textoBusqueda }
                    ]
                }
            ]
        };
    }

    if (Color === 'Blanco y Negro') {
        filtros.color = { $eq: false };
    } else {
        filtros.color = { $eq: true };
    }
    if (Estilos) {
        if (Estilos.length > 0) {
            filtros.estilos = { $in: Estilos };
        }
    }
    if (Zonas) {
        if (Zonas.length > 0) {
            filtros.zonas = { $in: Zonas };
        }
    }

    try {
        let design, total;
        if (uid) {
            if (texto) {
                [design, total] = await Promise.all([
                    //Designs.find({ $and: [{ guardados: uid }, { $or: [{ nombre: textoBusqueda }, { descripcion: textoBusqueda }] }] }).skip(desde).limit(registropp),
                    Designs.find(filtros).skip(desde).limit(registropp),
                    //Designs.countDocuments({ $and: [{ guardados: uid }, { $or: [{ nombre: textoBusqueda }, { descripcion: textoBusqueda }] }] })
                    Designs.countDocuments(filtros)

                ]);
            } else {
                [design, total] = await Promise.all([
                    //Designs.find({ $or: [{ guardados: uid }] }).skip(desde).limit(registropp),
                    Designs.find(filtros).skip(desde).limit(registropp),
                    //Designs.countDocuments({ $or: [{ guardados: uid }] })
                    Designs.countDocuments(filtros)
                ]);
            }
        } else {
            return res.status(400).json({
                ok: false,
                msg: 'Error de uid al obtener guardados'
            });
        }
        res.json({
            ok: true,
            msg: 'obtenerGuardados',
            design,
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
            msg: 'Error al obtener guardados'
        });
    }


}


const crearDesign = async(req, res = response) => {
    console.log(1)
    console.log('body ', req.body);
    //console.log('body archivo: ', req.body.archivo.files);
    const nombre = String(req.body.nombre);
    const usuario = String(req.body.usuario);
    const tipo = "publicacion";
    try {
        // Comrprobar que no existe un diseño con ese nombre y que pertenezca al mismo usuario
        const existeDesign = await Designs.findOne({ nombre: nombre, usuario: usuario }); // En case de querer evitar copias de imagenes habrá que hacer algo
        if (existeDesign) {
            return res.status(400).json({
                ok: false,
                msg: 'El diseño ya existe'
            });
        }

        //al no existir diseño lo que hago es subir la imagen al servidor
        console.log(2)
            //primero compruebo que me hayan pasado un archivo:

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                ok: false,
                msg: 'No se ha subido el archivo'
            });
        }

        //segundo compruebo que ese archivo sea del tamaño adecuado:
        console.log(2.2)
        if (req.files.archivo.truncated) {
            return res.status(400).json({
                ok: false,
                msg: `El archivo es demasiado grande, permitido hasta ${process.env.MAXSIZEUPLOAD}MB`
            });
        }

        //tercero compruebo que ese archivo sea de tipo imagen:
        console.log(3)
        const archivosValidos = ['jpeg', 'jpg', 'png'];

        const archivo = req.files.archivo;
        const formato = archivo.mimetype;
        const formatoPartido = formato.split('/');
        const extension = formatoPartido[formatoPartido.length - 1];

        if (!archivosValidos.includes(extension)) {
            return res.status(400).json({
                ok: false,
                msg: `El tipo de archivo ${extension} no está permitido. Si permitidos: (${archivosValidos}) `,
            });
        }
        console.log('1 paso');

        //DONDE SE GUARDARÁ LA IMAGEN
        const path = `${process.env.PATHUPLOAD}/publicacion`;
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
            actualizarBD(tipo, path, nombreArchivo, usuario)
                .then(valor => {
                    if (!valor) {
                        fs.unlinkSync(patharchivo); //esto lo hago para que si da error se borre la imagen y no se suba
                        return res.status(400).json({
                            ok: false,
                            msg: `No se pudo actualizar BD`,
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

        console.log('2 paso');
        const nuevodesign = new Designs(req.body);

        nuevodesign.imagen_id = nombreArchivo;
        console.log('SOY NUEVO DESIGN ', nuevodesign);
        addData(nuevodesign, 'design');
        // Almacenar en BD
        await nuevodesign.save();

        console.log('3 paso');
        addLog(usuario._id, 'informativo', 'Crear Diseno',
            `El usuario con email ${usuario.email} ha creado un design con id ${nuevodesign._id}`);
        res.json({
            ok: true,
            msg: 'Design creado',
            nuevodesign,
        });
    } catch (error) {
        console.log(error);
        addLog(usuario._id, 'error', 'Crear Diseno',
            `Error creando design`);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando design'
        });
    }
}

const actualizarDesign = async(req, res) => {
    const nombre = String(req.body.nombre).trim();
    const uid = req.body.uid;
    const did = req.params.id;

    const object = req.body;

    const token = req.header('x-token');

    console.log('DATOS ACTUA: ', nombre, uid, did, object, token);
    try {
        // Si han enviado el nombre, comprobar que no exista otro en BD con el mismo nombre
        if (nombre) {
            const existeDesign = await Designs.findOne({ nombre: nombre });
            if (existeDesign) {
                if (existeDesign._id != did) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'Ya existe una design con este nombre'
                    });
                }
            }
            // object.nombre = nombre;
        }
        //Solo administradores y propietarios del diseño pueden editar diseños 
        if (!(infoToken(token).rol === 'ROL_ADMIN') && !(infoToken(token).uid === uid)) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para editar diseños2',
            });
        }

        const existeUsu = await Usuario.findById(uid);
        if (!existeUsu) {
            return res.status(400).json({
                ok: false,
                msg: 'Error en los datos al ejecutar la llamada'
            });
        }

        // Comprobamos si existe el diseño que queremos editar
        const existeDesign = await Designs.findById(did);
        if (!existeDesign) {
            return res.status(400).json({
                ok: false,
                msg: 'El design no existe'
            });
        }

        //comprobamos que el usuario sea el que consta en el diseño que queremos actualizas
        console.log('11111: ', existeDesign.usuario, ' = ', uid, '   ', infoToken(token).rol, ' = ', 'ROL_ADMIN');
        if (!(existeDesign.usuario.toString() === uid) && !(infoToken(token).rol === 'ROL_ADMIN')) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para editar diseños'
            });
        }

        console.log('editarDesign 2');



        const design = await Designs.findByIdAndUpdate(did, object, { new: true });


        addLog(uid, 'informativo', 'Actualizar Diseno',
            `El usuario con email ${existeUsu.email} ha actualizado un design con id ${did}`);
        res.json({
            ok: true,
            msg: 'Usuario actualizado',
            design
        });
    } catch (error) {
        console.log(error);
        addLog(usuario._id, 'error', 'Actualizar Diseno',
            `Error actualiando design`);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando design'
        });
    }
}

const actualizarGuardados = async(req, res) => {

    const uid = req.params.id || '';
    var newuid = new Usuario();
    newuid._id = uid; // preguntar como declarar uid como un verdadero uid de usuario de forma no marronera

    console.log('Actualizar guardados uid: ', uid);
    console.log('Actualizar guardados newuid: ', newuid._id);
    const did = req.body.did || '';

    if (!uid) {
        return res.status(400).json({
            ok: false,
            msg: 'Error no estas autorizado para realizar esta accion'
        });
    }
    if (!did) {
        return res.status(400).json({
            ok: false,
            msg: 'Error no estas autorizado para realizar esta accion'
        });
    }


    try {
        const existeDesign = await Designs.findById(did);
        //var existeUsuario = false;
        //console.log('Actualizar guardados 0: ', existeDesign.guardados[0]._id);


        var newDesign = await Designs.findOne({ _id: did, guardados: { $in: [uid] } });

        console.log('Actualizar guardados 0: ', newDesign);
        if (newDesign) {
            newDesign.guardados.pull(uid);

            const design = await Designs.findByIdAndUpdate(did, newDesign, { new: true });
            updateData(design, 'guardados');
            addLog(design._id, 'informativo', 'Actualizar Guardados',
                `El diseno con nombre ${design.nombre} ha sido retirado de guardados`);
            res.json({
                ok: true,
                msg: 'Design actualizado',
                design
            });


        } else {
            existeDesign.guardados.push(uid);

            const design = await Designs.findByIdAndUpdate(did, existeDesign, { new: true });
            updateData(design, 'guardados');
            addLog(design._id, 'informativo', 'Actualizar Guardados',
                `El diseno con nombre ${design.nombre} ha sido añadido en guardados`);
            res.json({
                ok: true,
                msg: 'Design actualizado',
                design
            });

        }
        // for (let index = 0; index < existeDesign.guardados.length; index++) {
        //     console.log('Actualizar guardados lista de guardados: ', existeDesign.guardados[index]);
        //     if (existeDesign.guardados[index] == newuid._id) {
        //         existeUsuario = true;
        //         console.log('Actualizar guardados 1: ', existeDesign.guardados);
        //         existeDesign.guardados.splice(index, 1);
        //         console.log('Actualizar guardados 2: ', existeDesign.guardados);
        //     }
        // }

        // if (!existeUsuario) {
        //     existeDesign.guardados.push(uid);
        // }





    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error actualizando guardados de design'
        });
    }
}

const borrarDesign = async(req, res = response) => {
    console.log('borrarDesign: ', req.query.uid);
    const uid = req.query.uid || '';
    const did = req.params.id;
    const token = req.header('x-token');
    console.log('borrarDesign 1', uid, did, token);
    if (!did || !uid || !token) {
        return res.status(400).json({
            ok: false,
            msg: 'Faltan datos para ejecutar la llamada',
        });
    }
    console.log('borrarDesign 1.1');
    try {
        //Comprobamos que existe el usuario que nos pasan S
        const existeUsu = await Usuario.findById(uid);
        if (!existeUsu) {
            return res.status(400).json({
                ok: false,
                msg: 'Error en los datos al ejecutar la llamada'
            });
        }

        console.log('borrarDesign 1.2');
        //Solo administradores y propietarios del diseño pueden borrar diseños S
        if (!(infoToken(token).rol === 'ROL_ADMIN') && !(infoToken(token).uid === uid)) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para borrar diseños',
            });
        }

        console.log('borrarDesign 1.3');
        // Comprobamos si existe el diseño que queremos borrar S
        const existeDesign = await Designs.findById(did);
        if (!existeDesign) {
            return res.status(400).json({
                ok: false,
                msg: 'El design no existe'
            });
        }

        console.log('borrarDesign 1.4');
        // obtenemos el nombre de la imagen que se borrará S
        const nombreArchivo = existeDesign.imagen_id;
        if (!nombreArchivo) {
            return res.status(400).json({
                ok: false,
                msg: 'Error en el borrado del diseño'
            });
        }

        console.log('borrarDesign 1.5');
        // De nuevo una comprobacion de ids para confirmar que nos encontramos ante el autor del diseño o un administrador S
        if (!(infoToken(token).rol === 'ROL_ADMIN') && !(existeDesign.usuario.toString() === existeUsu._id.toString())) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para borrar este diseño',
            });
        }

        console.log('borrarDesign 2');
        // Comprobamos si existe la imagen existe
        const path = `${process.env.PATHUPLOAD}/publicacion`;
        const patharchivo = `${path}/${nombreArchivo}`;

        if (!fs.existsSync(patharchivo)) { // si no existe el path del archivo
            return res.status(400).json({
                ok: false,
                msg: 'Archivo no existe',

            });
        }


        // Lo eliminamos y devolvemos el usuaurio recien eliminado
        const resultado = await Designs.findByIdAndRemove(did);


        // Eliminamos la imagen de la base de datos
        fs.unlink(patharchivo, (err) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error al eliminar archivo',
                });
            }
        });

        console.log('borrarDesign 3');

        addLog(uid, 'informativo', 'Borrar Diseno',
            `El diseno con id ${resultado._id} ha sido eliminado`);
        res.json({
            ok: true,
            msg: 'Design eliminado',
            resultado: resultado
        });
    } catch (error) {
        console.log(error);
        addLog(null, 'error', 'Borrar Diseno',
            `Error borrando design`);
        return res.status(400).json({
            ok: false,
            msg: 'Error borrando design'
        });
    }
}

const anadirVista = async(req, res = response) => {

    const uid = String(req.body.uid);
    const did = String(req.body.did);

    try {

        if (!uid || uid === '') {
            return res.status(400).json({
                ok: false,
                msg: 'Error creando design'
            });
        }

        if (!did || did === '') {
            return res.status(400).json({
                ok: false,
                msg: 'Error creando design'
            });
        }

        addLog(uid, 'informativo', 'Vista',
            `El usuario con id ${uid} ha visto el design con id ${did}`, did);

        res.json({
            ok: true,
            msg: 'Design Visto',
        });
    } catch (error) {
        console.log(error);
        addLog(uid, 'error', 'Vista',
            `Error viendo design`, did);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando design'
        });
    }
}

const anadirVista2 = async(req, res = response) => {

    let uid = String(req.body.uid);
    const did = String(req.body.did);

    try {

        if (!did || did === '') {
            return res.status(400).json({
                ok: false,
                msg: 'Error creando design'
            });
        }

        if (uid === '') {
            uid = 'NR';
        }

        addLog(uid, 'informativo', 'Vista',
            `Un usuario sin registrar ha visto el design con id ${did}`, did);

        res.json({
            ok: true,
            msg: 'Design Visto',
        });
    } catch (error) {
        console.log(error);
        addLog(uid, 'error', 'Vista',
            `Error viendo design`, did);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando design'
        });
    }
}

module.exports = { obtenerDesign, crearDesign, actualizarDesign, borrarDesign, obtenerGuardados, actualizarGuardados, anadirVista, anadirVista2 }