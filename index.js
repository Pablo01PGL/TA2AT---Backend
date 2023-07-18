/*
Importación de módulos
*/
//---------MySQl------------------------




const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const fileUpload = require('express-fileupload');
require('dotenv').config();
const { dbConnection } = require('./database/configdb'); //no hace falta poner .js en el configdb porque javascript lo reconoce
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');
const { dbConnectionMysql } = require('./database/configdbMysql');
// Crear una aplicación de express
const app = express();



dbConnection(); //siempre antes del listen llamar a la base de datos para que no de errores
//dbConnectionMysql();
/*
app.use((req, res, next) => {
    console.log("Se esta haciendo un log");
    const timestamp = new Date().toISOString();
    const message = `${req.method} ${req.url} ${res.statusCode}`;
    const query = `INSERT INTO logs (timestamp, message) VALUES ('${timestamp}', '${message}')`;
    connection.query(query, (error, results, fields) => {
      if (error) throw error;
      next();
    });
  });
*/
app.use(cors());
app.use(express.json()); //es un midleware que reconstruye la request como si fuera un json
//tambien lo que hace es que nos da acceso a propiedades de la request 
//y ademas nos hace saltar errores de las peticiones que esten mal hechas
app.use(fileUpload({
    limits: { fileSize: process.env.MAXSIZEUPLOAD * 1024 * 1024 },
    abortOnLimit: false, //esto hace si esta en true que cuando se llega al maximo indicado en la linea superior y cancela la subida ||| Pero nosotros lo controlamos en el controllers
    createParentPath: true, //esto hace que si la carpeta a la que enviamos el archivo no existe, la crea
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); //documentación de la API (no estará)

app.use('/api/usuarios', require('./routes/usuarios')); //con esto hago que cuando haya que usar alguna ruta con/usuarios se va a atender desde aqui
app.use('/api/login', require('./routes/auth'));
app.use('/api/avatar', require('./routes/avatar'));
app.use('/api/design', require('./routes/design'));
app.use('/api/upload', require('./routes/uploads'));
app.use('/api/webhook', require('./routes/webhook'));
app.use('/api/notificaciones', require('./routes/notificaciones'));
app.use('/api/mensajes', require('./routes/mensajes'));
app.use('/api/opendata', require('./routes/opendata'));
// Abrir la aplicacíon en el puerto 3000
app.listen(process.env.PORT, () => {
    console.log('Servidor corriendo en el puerto ', process.env.PORT);
});
//Esta instrucción lo que hace es ante una petición "get /", es decir una petición HTTP de tipo GET al recurso "/", responder con un mensaje, que en este caso está montado 
//como un JSON en el que hay dos campos, el campo "ok" con el valor "true" y el campo "msg" con el valor 'Hola mundo'.