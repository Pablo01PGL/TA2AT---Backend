const { connection } = require("../database/configdbMysql");


const addLog = async(uid, tipo, accion, descripcion, did = null) => {
    try {
        const currentDate = new Date();
        const options2 = { timeZone: 'Europe/Madrid', hour12: false };
        const madridTime = currentDate.toLocaleString('en-US', options2);
        var [date, time] = madridTime.split(', ');

        const [month, day, year] = date.split('/');
        let [hour, min, sec] = time.split(':');
        if (hour === '24') {
            hour = '00';
        }
        const mysqlFormattedTime = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour}:${min}:${sec}`;

        connection.query(`INSERT INTO logs (tipo,uid,accion,descripcion,timestamp,did) VALUES ('${tipo}','${uid}','${accion}','${descripcion}','${mysqlFormattedTime}','${did}')`, function(error) { // NO EXISTE CONNECT
            if (error) {
                console.log(error);
            } else {
                //   console.log('Conexion correcta.');
            }
        });
    } catch (error) {
        console.log(error);
    }
}
module.exports = { addLog }