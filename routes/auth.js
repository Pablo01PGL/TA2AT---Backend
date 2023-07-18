/* 
Ruta base: /api/login
*/


const { Router } = require('express');
const { login, token, register, RGoogle, LGoogle, confirmarUsuario, sendRecovery, recaccount } = require('../controllers/auth');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarRolRegister } = require('../middleware/validar-rol');

const router = Router();

router.get('/token', [
    check('x-token', 'El argumento x-token es obligatorio').not().isEmpty(),
    validarCampos,
], token);

router.get('/confirm/:token', [], confirmarUsuario);

//router.get('/recovery/:token', [], sendRecovery);

router.post('/recovery', [], sendRecovery);

router.post('/', [
    check('password', 'El argumento pasword es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    validarCampos,
], login);

router.post('/register', [
    //check('usu', 'El argumento nombre de usuario es obligatorio').not().isEmpty().trim(),
    //check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    //check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty().trim(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    //check('fnacimiento', 'La fecha debe de ser correcta').not().isEmpty().isDate(),
    check('activo', 'El estado activo debe ser true/false').optional().isBoolean(),
    validarCampos,
    validarRolRegister
], register);

router.post('/google/register', [
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('firstName', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('lastName', 'El argumento apellidos es obligatorio').not().isEmpty().trim(),
    check('photoUrl', 'Foto opcional').optional().trim(),
    validarCampos,
    validarRolRegister
], RGoogle);

router.post('/google/login', [
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    validarCampos,
], LGoogle);

router.put('/recaccount', [
    validarJWT,
], recaccount);

module.exports = router;