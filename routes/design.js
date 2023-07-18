const { Router } = require('express');
const { obtenerDesign, obtenerGuardados, crearDesign, actualizarDesign, actualizarGuardados, borrarDesign, anadirVista, anadirVista2 } = require('../controllers/design.js');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const router = Router();


router.get('/', [
    //validarJWT,
    check('id', 'El id de usuario debe ser válido').optional().isMongoId(), //comprobamos con ismongo que es una cadena de mongo y no vacia
    check('desde', 'El desde debe ser un número').optional().isNumeric(),
    validarCampos,
], obtenerDesign);

router.get('/guardados/', [
    validarJWT,
    check('id', 'El id de usuario debe ser válido').optional().isMongoId(), //comprobamos con ismongo que es una cadena de mongo y no vacia
    check('desde', 'El desde debe ser un número').optional().isNumeric(),
    validarCampos,
], obtenerGuardados);

router.post('/', [ //si quisiera que se pasara por parametro lo coloco aqui así '/:id'
    validarJWT,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('usuario', 'El argumento usuario es obligatorio').isMongoId(),
    // Opcionales lista de profesores, si viene comprobar que es id válido
    //check('lpt.*.usuario', 'El identificador de profesor no es válido').optional().isMongoId(),
    validarCampos,
], crearDesign);

router.post('/vista/', [
    validarJWT,
    validarCampos,
], anadirVista);

router.post('/vista2/', [
    validarCampos,
], anadirVista2);


router.put('/:id', [
    validarJWT,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos,
], actualizarDesign);

router.put('/guardados/:id', [
    //validarJWT,
    //check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    //check('uid', 'El identificador no es válido').isMongoId(),
    //validarCampos,
], actualizarGuardados);


router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos,
], borrarDesign);


module.exports = router;