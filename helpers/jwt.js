const jwt = require('jsonwebtoken');

const generarJWT = (uid, rol) => {
    return new Promise((resolve, reject) => { // Este tipo de objeto hace que si todo va bien hace resolve y si algo va mal reject.
        const payload = {
                uid,
                rol
            }
            //console.log('firmar este:', payload)
        jwt.sign(payload, process.env.JWTSECRET, { // Aqui firmamos el payload con nuestra calve secreta, primero ponemos que queremos firmar y luego con que.
            expiresIn: '1y'
        }, (err, token) => { // Este signo es otro promise porque o devuelve un error o el resultado final (el token).
            if (err) {
                console.log(err);
                reject('No se pudo generar el JWT');
            } else {
                resolve(token);
            }
        });
    });
}

module.exports = { generarJWT } // De nuevo, esto es para que la funcion se pueda usar fuera.