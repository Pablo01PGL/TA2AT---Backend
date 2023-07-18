const { Router } = require('express');
const { obtenerAvatar, crearAvatar, actualizarAvatar, borrarAvatar } = require('../controllers/avatar');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const router = Router();


router.get('/', [
    validarJWT,
    check('id', 'El id de usuario debe ser válido').optional().isMongoId().trim(), // esto es lo que quita los espacios por si en el futuro hay problemas
    check('desde', 'El desde debe ser un número').optional().isNumeric().trim(),
    validarCampos,
], obtenerAvatar);

router.post('/', [ //si quisiera que se pasara por parametro lo coloco aqui así '/:id'
    // validarJWT,
    // check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('usuario', 'El argumento usuario es obligatorio').isMongoId(),
    // Opcionales lista de profesores, si viene comprobar que es id válido
    // check('tatuajes.*.design', 'El identificador de tatuaje no es válido').optional().isMongoId(),
    validarCampos,
], crearAvatar);


router.put('/', [ // Esto vale para cambiar el email
    validarJWT,
    // check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    // check('id', 'El identificador no es válido').isMongoId(),
    // check('tatuajes.*.design', 'El identificador de tatuaje no es válido').optional().isMongoId(),
    validarCampos,
], actualizarAvatar);


router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos,
], borrarAvatar);


module.exports = router;