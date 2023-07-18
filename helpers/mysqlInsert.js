const { connection } = require("../database/configdbMysql");
//const { dbConnectionMysql } = require("../database/configdbMysql");



const addData = async(obj,tipo) => {
    console.log("Se estan añadiendo datos");
    console.log("OBJ: ",obj);
    
    switch (tipo) {
        case 'usuarios':
         let imagen = obj.imagen || null ;
            connection.query(`INSERT INTO ${tipo} (_id,nombre,apellidos,email,password,rol,activo,alta,__v,imagen,status) VALUES ('${obj._id}','${obj.nombre}','${obj.apellidos}','${obj.email}','${obj.password}','${obj.rol}','${obj.activo}','${obj.alta}','${0}','${imagen}','${obj.status}')`,function(error){ // NO EXISTE CONNECT
                if(error){
                   throw error;
                }else{
                   console.log('Conexion correcta.');
                }
             });
            break;
        case 'design':
         let estilos = obj.estilos;
         estilos = JSON.stringify(estilos);

         let zonas = obj.zonas;
         zonas = JSON.stringify(zonas);

         let guardados = obj.guardados;
         guardados = JSON.stringify(guardados);
            connection.query(`INSERT INTO ${tipo} (_id,nombre,color,estilos,zonas,descripcion,usuario,autor,guardados,imagen_id,__v) VALUES ('${obj._id}','${obj.nombre}','${obj.color}','${estilos}','${zonas}','${obj.descripcion}','${obj.usuario}','${obj.autor}','${guardados}','${obj.imagen_id}','${0}')`,function(error){ // NO EXISTE CONNECT
                if(error){
                   throw error;
                }else{
                   console.log('Conexion correcta.');
                }
             });
        break;
    
        default:
            break;
    }
    
    //const query = `INSERT INTO logs (tipo,uid,accion,descripcion,timestamp) VALUES ('${uid}','${tipo}','${accion}','${descripcion}','${timestamp}')`;
   
}
const updateData = async(obj,tipo) => {
   console.log("Se estan añadiendo datos");
  
   
   switch (tipo) {
      
       case 'usuarios':
         /*
        let imagen = obj.imagen || null ;
           connection.query(`INSERT INTO ${tipo} (_id,nombre,apellidos,email,password,rol,activo,alta,__v,imagen,status) VALUES ('${obj._id}','${obj.nombre}','${obj.apellidos}','${obj.email}','${obj.password}','${obj.rol}','${obj.activo}','${obj.alta}','${0}','${imagen}','${obj.status}')`,function(error){ // NO EXISTE CONNECT
               if(error){
                  throw error;
               }else{
                  console.log('Conexion correcta.');
               }
            });
            */
           break;
       case 'design':
         /*
        let estilos = obj.estilos;
        estilos = JSON.stringify(estilos);

        let zonas = obj.zonas;
        zonas = JSON.stringify(zonas);

        let guardados = obj.guardados;
        guardados = JSON.stringify(guardados);
           connection.query(`INSERT INTO ${tipo} (_id,nombre,color,estilos,zonas,descripcion,usuario,autor,guardados,imagen_id,__v) VALUES ('${obj._id}','${obj.nombre}','${obj.color}','${estilos}','${zonas}','${obj.descripcion}','${obj.usuario}','${obj.autor}','${guardados}','${obj.imagen_id}','${0}')`,function(error){ // NO EXISTE CONNECT
               if(error){
                  throw error;
               }else{
                  console.log('Conexion correcta.');
               }
            });
            */
       break;

       case 'guardados':
         console.log('OBJ UPDATE: ',obj);
         let guardados = obj.guardados;
         guardados = JSON.stringify(guardados);
            connection.query(`UPDATE design set guardados = '${guardados}' where _id = '${obj._id}' `,function(error){ // NO EXISTE CONNECT
               if(error){
                  throw error;
               }else{
                  console.log('Conexion correcta.');
               }
            });
         break;
   
       default:
           break;
}
}

const deleteData = async(uid,tipo,accion,descripcion) => {
 
}
module.exports = {addData, updateData}


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