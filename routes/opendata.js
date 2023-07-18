/* 
Ruta base: /api/opendata
*/

const express = require('express');
const router = express.Router();
const datosAbiertosController = require('../controllers/opendata');

router.get('/', [], datosAbiertosController.getDatosAbiertos);

module.exports = router;