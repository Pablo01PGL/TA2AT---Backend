/*
Todo lo que llega aqui viene de /api/usuarios
*/
const { Router } = require('express');
const { obtenerUsuario, existeEmail, crearUsuario, actualizarUsuario, borrarUsuario, actualizarPassword, obtenerUsuariosChat, actualizarTour } = require('../controllers/usuarios'); //invoco los metodos de controllers
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos'); //invoco los metodos de validar campos, en concreto el que he puesto, validarCampos.
const { validarRol } = require('../middleware/validar-rol');
const { validarJWT } = require('../middleware/validar-jwt');

const router = Router();

router.get('/', [
    validarJWT,
    // Campos opcionales, si vienen los validamos
    check('id', 'El id de usuario debe ser válido').optional().isMongoId(), //comprobamos con ismongo que es una cadena de mongo y no vacia
    check('desde', 'El desde debe ser un número').optional().isNumeric(),
    validarCampos,
], obtenerUsuario);

router.get('/chat/', [
    validarJWT,
    validarCampos,
], obtenerUsuariosChat);

router.get('/ee/:email', [ //Preguntar como hacer esta comprobacion de forma segura
    //validarJWT,
    // Campos opcionales, si vienen los validamos
    //check('id', 'El id de usuario debe ser válido').optional().isMongoId(), //comprobamos con ismongo que es una cadena de mongo y no vacia
    //check('desde', 'El desde debe ser un número').optional().isNumeric(),
    validarCampos,
], existeEmail);

router.post('/', [
    validarJWT,
    //check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(), //aqui vamos a hacer la llamada para saber si existen los argumento enviado por el post con el not is empty
    //check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty().trim(), // el trim es para quitar los espacios
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    // campos que son opcionales que vengan pero que si vienen queremos validar el tipo
    check('activo', 'El estado activo debe ser true/false').optional().isBoolean(),
    validarCampos,
    validarRol
], crearUsuario);
/*
router.put('/:id', [ //aqui pongo id porque cuando lo envien nos pasará el id y nos valida que sea de tipo mongo id
    validarJWT,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    check('id', 'El identificador no es válido').isMongoId(), // este se pasa por parametro en el postman o a la hora de ejecutarlo 
    check('activo', 'El estado activo debe ser true/false').optional().isBoolean(),
    validarCampos,
    validarRol
], actualizarUsuario);
*/

router.put('/np/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    check('password', 'El argumento password es obligatorio').not().isEmpty().trim(),
    check('nuevopassword', 'El argumento nuevopassword es obligatorio').not().isEmpty().trim(),
    check('nuevopassword2', 'El argumento nuevopassword2 es obligatorio').not().isEmpty().trim(),
    // campos que son opcionales que vengan pero que si vienen queremos validar el tipo
    validarCampos,
], actualizarPassword);

router.put('/tour/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
], actualizarTour);

router.put('/:id', [
    validarJWT,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty().trim(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('email', 'El argumento email debe ser un email').isEmail(),
    check('id', 'El identificador no es válido').isMongoId(),
    // campos que son opcionales que vengan pero que si vienen queremos validar el tipo
    check('activo', 'El estado activo debe ser true/false').optional().isBoolean(),
    validarCampos,
], actualizarUsuario);

router.put('/tour/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
], actualizarTour);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarUsuario);

module.exports = router;