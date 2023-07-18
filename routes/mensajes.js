/* 
Ruta base: /api/mensajes
*/

const { Router } = require('express');
const { crearMensajeForm, getMensajeForm, actualizarMensajeForm } = require('../controllers/mensajes');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const router = Router();

router.get('/', [
    validarJWT,

    validarCampos,
], getMensajeForm);


router.post('/', [ //si quisiera que se pasara por parametro lo coloco aqui así '/:id'
    validarJWT,
    // Opcionales lista de profesores, si viene comprobar que es id válido
    //check('lpt.*.usuario', 'El identificador de profesor no es válido').optional().isMongoId(),
    validarCampos,
], crearMensajeForm);

router.put('/', [ //si quisiera que se pasara por parametro lo coloco aqui así '/:id'
    validarJWT,
    // Opcionales lista de profesores, si viene comprobar que es id válido
    //check('lpt.*.usuario', 'El identificador de profesor no es válido').optional().isMongoId(),
    validarCampos,
], actualizarMensajeForm);



module.exports = router;