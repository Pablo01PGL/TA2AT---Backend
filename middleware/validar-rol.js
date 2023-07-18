const { response } = require('express');
const rolesPermitidos = ['ROL_USUARIO', 'ROL_ESTUDIO', 'ROL_ADMIN'];
const rolesPermitidosRegister = ['ROL_USUARIO', 'ROL_ESTUDIO'];

const validarRol = (req, res = response, next) => {

    const rol = req.body.rol;

    if (rol && !rolesPermitidos.includes(rol)) {
        return res.status(400).json({
            ok: false,
            msg: 'Rol no permitido'
        });
    }
    next();
}

const validarRolRegister = (req, res = response, next) => {

    const rol = req.body.rol;

    if (rol && !rolesPermitidosRegister.includes(rol)) {
        return res.status(400).json({
            ok: false,
            msg: 'Rol no permitido'
        });
    }
    next();
}

module.exports = { validarRol, validarRolRegister }