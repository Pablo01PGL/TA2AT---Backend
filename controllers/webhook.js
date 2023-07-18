const {WebhookClient, Image, Card, Payload} = require('dialogflow-fulfillment');
const { mongo } = require('mongoose');
const conexiondb = require("../database/configdb");
const usuarios =  require("../models/usuarios");
const designs = require("../models/design");

//const { DesignService } = require('../../Frontend/src/app/services/design.service');
const { Router } = require('express');
const { data } = require('jquery');
const router = Router();
var idUsuario ;
var usuario = '' ;
var tatuaje = '';
var parameters ;
let userm;
const postDialogflow = (req,res=response)=>{
   // parameters = req.body.queryResult.parameters || {};
    const agent= new WebhookClient({request:req,response:res});
    let intentMap = new Map();
    intentMap.set('MiUsuarioIntent', miFuncionU);
    intentMap.set('Tatuajes_myproyect_Image_fallback', miFuncionT);
    intentMap.set('Tatuajes_myproyect_Lista', listaTatus);
    intentMap.set('Total_Estudios_Intent', totalEstudios);

    agent.handleRequest(intentMap);
}


const miFuncionU = async(agent) => {
    console.log('HOLA');
    if (usuario === '') {
        agent.add('No tiene nombre de usuario, puede añadir uno en editar perfil');
    } else {
        console.log(usuario);
        agent.add(`Tu nombre de usuario es ${usuario}`);
    }
    agent.add('Tienes alguna pregunta mas?');
    
}
/*
const mostrarImagen = async(agent) => { // GOOOOOOOOD
    agent.add(`which one u want`);
    const payload = {
    "richContent":[
        [
          {
            "type": "image",
            "rawUrl": "https://www.querry.com/wp-content/uploads/2022/08/1366_2000.jpg",
            "accessibilityText": "Example logo"
          }
        ]
      ]
    };
    agent.add(new Payload(agent.UNSPECIFIED, payload, {rawPayload: true, sendAsMessage: true}));
}
*/

const miFuncionT = async(agent) => { 
    
    const userm = agent.query;
    console.log('Userm',userm);


    let listaTatus = await designs.find();
    
  
    for (let index = 0; index < listaTatus.length; index++) {
     
     const element = listaTatus[index].nombre;
        if(element === userm){
            agent.add(`Aaaaaaaaaaqui te mostramos un ejemplo un tatuaje de tipo: ${userm}`);
        }
    }



    let tatu = '';
     tatu = await designs.find({ nombre: userm });
    console.log('tatu',tatu[0]);
    if(!tatu[0]){
        tatu=await designs.find({ nombre: userm.toUpperCase() });
    }
    if(!tatu[0]){
        tatu=await designs.find({ nombre: userm.charAt(0).toUpperCase() + userm.slice(1) });
    }
    if(!tatu[0]){
        tatu=await designs.find({ nombre: { $regex: "^" + userm, $options: "i" } });
    }
    
    console.log('tatudef',tatu[0]);
    if(tatu[0]){
        let url = `http://ta2at.ovh/api/upload/publicacion/${tatu[0].imagen_id}`; // CAMBIAR A TA2AT.OVH
        agent.add(`Aqui te mostramos un ejemplo un tatuaje de tipo: ${tatu[0].nombre}`);
        const payload = {
        "richContent":[
            [
            {
                "type": "image",
                "rawUrl": url,
                "accessibilityText": "Example logo"
            }
            ]
        ]
        };
        agent.add(new Payload(agent.UNSPECIFIED, payload, {rawPayload: true, sendAsMessage: true}));
        agent.add(`Aqui te mostramos su descripcion: ${tatu[0].descripcion}`);
    }else {
        agent.add(`No disponemos del tipo de tatuaje ${userm} , pruebe con otro`);
    }
    
    agent.add('Tienes alguna pregunta mas?');
}


const listaTatus = async(agent) => { 
   
   agent.add(`Voy a mostrar 20 nombre de los tatuajes que disponemos, si deseas verlos todos puedes hacerlo desde la pestaña explorar:`);
   let listaTatus = await designs.find();
   let string = '';
   let num=0;
   
   for (let index = 0; index < listaTatus.length; index++) {
    if(num<=20){
    num = num + 1;
    const element = listaTatus[index].nombre;
    string =  listaTatus[index].nombre  + ', '+ string ;
    }
    else{
        break;
    }
   }
   agent.add(`${string}`);
 
   //else{
   
   agent.add(`Si quieres ver alguno de estos tatuajes, introduzca un nombre en el apartado del chatbot: TATUAJES,IMAGEN TATUAJE`);
  // }
}


const totalEstudios = async(agent) => { 
    let tEstudios = await usuarios.find();
    let string = '';
    let string2 = '';
    let cont = 0;
    for (let index = 0; index < tEstudios.length; index++) {
        
        if(tEstudios[index].rol === 'ROL_ESTUDIO'){
            cont = cont +1;
            if(tEstudios[index].nombre_estudio !== null)
                string =  tEstudios[index].nombre_estudio  + ','+ string ;
                //string2 =  tEstudios[index] + ','+ string2 ;
        }
    }
   // console.log('testudios',string2);
    agent.add(`En este momento hay un total de ${cont} estudios`);
    agent.add(`Sus nombres son: ${string}`);
    agent.add('Tienes alguna pregunta mas?');
}


const seleccionarFuncion = async(req, res) => {
    try {
        let funcion = req.header('funcion');
        switch (funcion) {
            case 'miFuncionU':
                usuario = req.header('datos');
                return;
        }
    } catch(error){
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error chatbot'
        });
    }
}




module.exports = { postDialogflow , seleccionarFuncion}
