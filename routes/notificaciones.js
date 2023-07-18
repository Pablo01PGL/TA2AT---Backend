/* 
Ruta base: /api/notificaciones
*/

const { Router } = require('express');
const { crearContactoForm, getContactoForm, crearValoracion } = require('../controllers/notificaciones');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const router = Router();

router.get('/contacto', [
    validarJWT,

    validarCampos,
], getContactoForm);


router.post('/contacto', [ //si quisiera que se pasara por parametro lo coloco aqui así '/:id'

    // Opcionales lista de profesores, si viene comprobar que es id válido
    //check('lpt.*.usuario', 'El identificador de profesor no es válido').optional().isMongoId(),
    validarCampos,
], crearContactoForm);

router.post('/valoracion/:id', [ //si quisiera que se pasara por parametro lo coloco aqui así '/:id'
    validarJWT,
    // Opcionales lista de profesores, si viene comprobar que es id válido
    //check('lpt.*.usuario', 'El identificador de profesor no es válido').optional().isMongoId(),
    validarCampos,
], crearValoracion);



module.exports = router;