/*
Todo lo que llega aqui viene de /api/webhook
*/

const { Router } = require('express');
const { postDialogflow, seleccionarFuncion } = require('../controllers/webhook');
const bodyParser = require('body-parser');
const { validarJWT } = require('../middleware/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos');

const router = Router();

router.use(bodyParser.json());

router.post('/', [], postDialogflow);

router.get('/', [
    validarJWT
], seleccionarFuncion);

module.exports = router;



