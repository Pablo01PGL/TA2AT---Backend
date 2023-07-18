//const mysql = require('mysql2/promise');
const mysql = require('mysql');



const connection = mysql.createConnection({
    host: 'ta2at.ovh',
    user: 'admin2',
    password: 'fApIjA281022%',
    database: 'delt4'
});


connection.connect();
module.exports = { connection };

//const mysql = require('mysql');
/*
const dbConnectionMysql = async() => {
    try {
      const sequelize = new Sequelize(process.env.MYSQLDBCONNECTION);

      await sequelize.authenticate();

        console.log('MySQl DB online');

    } catch (error) {
        console.log(error);
        throw new Error('Error al iniciar la BD');
    }
}

module.exports = {
  dbConnectionMysql
}


var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'TA2AT_DELT4',
  database: 'delt4'
});

connection.connect();

connection.query('SELECT * FROM notificaciones', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results);
});

connection.end();
*/