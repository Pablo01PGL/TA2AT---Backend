const nodemailer = require('nodemailer');

const mail = {
    user: 'ta2at.ua@gmail.com',
    pass: 'qohizbfaaigtmxxu'
}

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    tls: {
        rejectUnauthorized: false
    },
    secure: false, // true for 465, false for other ports
    auth: {
        user: mail.user, // generated ethereal user
        pass: mail.pass, // generated ethereal password
    },
});

const sendEmail = async(email, subject, html) => {
    try {

        await transporter.sendMail({
            from: `TA2AT <${ mail.user }>`, // sender address
            to: email, // list of receivers
            subject, // Subject line
            text: "Email de confirmacion", // plain text body
            html, // html body
        });

    } catch (error) {
        console.log('Algo no va bien con el email', error);
    }
}

const getTemplate = (name, token) => {
    return `
        <head>
            <link rel="stylesheet" href="./style.css">
        </head>
        
        <div id="email___content">
            <img src="" alt="">
            <h2>Hola ${ name }</h2>
            <p>Para confirmar tu cuenta, ingresa al siguiente enlace</p>
            <a
                href="http://localhost:3000/api/login/confirm/${ token }"
                target="_blank"
            >Confirmar Cuenta</a>
        </div>
      `;
}

const sendEmailRecovery = async(email, subject, html) => {
    try {

        await transporter.sendMail({
            from: `TA2AT <${ mail.user }>`, // sender address
            to: email, // list of receivers
            subject, // Subject line
            text: "Recuperacion cuenta", // plain text body
            html, // html body
        });

    } catch (error) {
        console.log('Algo no va bien con el email', error);
    }
}

const getTemplateRecovery = (name, token) => {
    return `
        <head>
            <link rel="stylesheet" href="./style.css">
        </head>
        
        <div id="email___content">
            <img src="" alt="">
            <h2>Hola ${ name }</h2>
            <p>Para recuperar la contraseña, ingresa al siguiente enlace</p>
            <a
                href="http://localhost:4200/recovery-contra?token=${ token }"
                target="_blank"
            >Cambiar contraseña</a>
        </div>
      `;
}

module.exports = {
    sendEmail,
    getTemplate,
    sendEmailRecovery,
    getTemplateRecovery
}