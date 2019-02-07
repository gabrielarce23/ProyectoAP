const { Usuario } = require('../models/usuario')
const { Rol } = require('../models/rol')
const { ObjectID } = require('mongodb')
const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const axios = require('axios')

const validarTipo = async (arrayUsuarios, tipoUsuario) => {
    let usuariosInvalidos = []
    const idTipoUsuario = await Rol.find({ codigo: tipoUsuario })
    let usuarios = await Usuario.find({ _id: { $in: arrayUsuarios } })
    for (usuario of usuarios) {
        if (!usuario.roles.includes(idTipoUsuario)) {
            usuariosInvalidos.push(usuario._id)
        }
    }
    return usuariosInvalidos


}


const validarId = async (arrayId) => {
    for (id of arrayId) {
        if (!ObjectID.isValid) {
            return false
        }
    }
    return true
}

const enviarCorreoAlta = async (usuario) => {

    const oauth2Client = new OAuth2(
        '349297601621-s63gdr5v1ms3kb88ahe5r4glaqire5t0.apps.googleusercontent.com',
        '4k7UuEp__UAjcVfOsVJtZTe0', // Client Secret
        'https://developers.google.com/oauthplayground' // Redirect URL
    );

    oauth2Client.setCredentials({
        refresh_token: '1/1tC904dBJ2cw_-7KUdqe9qroSdRr4Zpz6maMeJEHmQY'
    });
    const tokens = await oauth2Client.refreshAccessToken()
    const accessToken = tokens.credentials.access_token


    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: "OAuth2",
            user: "appcei.2018@gmail.com",
            clientId: "349297601621-s63gdr5v1ms3kb88ahe5r4glaqire5t0.apps.googleusercontent.com",
            clientSecret: "4k7UuEp__UAjcVfOsVJtZTe0",
            refreshToken: "1/1tC904dBJ2cw_-7KUdqe9qroSdRr4Zpz6maMeJEHmQY",
            accessToken: accessToken
        }
    });

    let ambiente;
    if (process.env.AMBIENTE === 'PROD') {
        ambiente = ''
    }
    else {
        ambiente = `[${process.env.AMBIENTE}] - `
    }
    let url = process.env.URLREGISTRO + `${usuario.tokens[0].token}`
    let html = `<h2>Hola! Bienvenido/a a la app del CEI.</h2>
                <p>Por favor ingresa al siguiente link para completar registro:</p>
                <a href="${url}">Link</a>`
    var mailOptions = {
        from: 'appcei.2018@gmail.com',
        to: usuario.email,
        subject: `${ambiente}Confirmación de registro y alta en CEIapp`,
        html
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
    });
}

const enviarNotificacion = async (usuario, title, body) => {
    var headers = {
        'Content-Type': 'application/json',
        'Authorization': process.env.PUSHTOKEN
    }
    
    for (let i = 1; i < usuario.tokens.length; i++) {
        
        let mensaje = {

            "to": usuario.tokens[i].token,
            "data": {
                "notification": {
                    "title": title,
                    "body": body
                }

            }

        }
        axios.post('https://fcm.googleapis.com/fcm/send', mensaje, { headers })
            .then((res) => {
                
            })
            .catch((error) => {
                console.log('Error al enviar notification ',mensaje)
            })

    }


}


module.exports = { validarTipo, validarId, enviarCorreoAlta, enviarNotificacion };