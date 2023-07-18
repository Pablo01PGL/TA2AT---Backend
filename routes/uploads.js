/* 
Ruta base: /api/upload
*/

const { Router } = require('express');
const { subirArchivo, enviarArchivo, borrarArchivo } = require('../controllers/uploads');
const { validarJWT } = require('../middleware/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos');

const router = Router();


router.get('/:tipo/:nombreArchivo', [
    //validarJWT,
    check('nombreArchivo', 'El nombre archivo debe de ser un nombre válido').trim(),
    validarCampos,
], enviarArchivo);

router.post('/:tipo/:id', [
    validarJWT,
    check('id', 'El id archivo debe de ser un nombre válido').isMongoId(),
    validarCampos,
], subirArchivo);

router.delete('/:tipo/:nombreArchivo', [
    validarJWT,
    validarCampos,
], borrarArchivo);



module.exports = router;