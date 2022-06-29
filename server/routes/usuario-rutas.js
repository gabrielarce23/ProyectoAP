var express = require('express');
var api = express.Router();
const { Usuario } = require('../models/usuario')
const { Categoria } = require('../models/categoria')
const { Rol } = require('../models/rol')
const _ = require('lodash')
const { ApiResponse } = require('../models/api-response')
const { ObjectID } = require('mongodb')


api.get('/usuarios', (req, res) => {

    Usuario.find({},{tokens: 0, password: 0})
        .then((usuarios) => res.status(200).send(new ApiResponse({ usuarios })))
        .catch((e) => res.status(400).send(new ApiResponse({}, `Mensaje: ${e}`)))
})

api.get('/usuarios/cuenta/:id',async (req,res)=>{
    try{
        let _id = req.params.id
        let usuario = await Usuario.findOne({_id}).populate('cuenta').exec()
      
        let cuenta = usuario.cuenta
        if(usuario){
            res.send(new ApiResponse({cuenta},'Ok'))
        }else{
            res.status(404).send(new ApiResponse({},'Usuario no encontrado'))
        }
    }catch(e){
        console.log(e)
        res.status(400).send(new ApiResponse({},''))
    }
})

api.get('/usuarios/:token', async (req, res) => {
    try {
        
        let token = req.params.token;

        usuario = await Usuario.findByToken(token)
        if (usuario) {

            res.header('x-auth', token).status(200).send(new ApiResponse({ usuario }))
        } else {
            res.status(404).send(new ApiResponse({}, 'Usuario inválido'))
        }
    } catch (e) {
        res.status(400).send(e)
    }

})

api.post('/usuarios', async (req, res) => {


    try {

        var usuario = new Usuario(_.pick(req.body, ['email']))
        usuario.email = usuario.email.toString().toLowerCase()
        let perfiles = req.body.perfiles
        usuario = await usuario.save()
        let categoriaCuota = await Categoria.findOne({ _id: req.body.categoriacuota })
        const token = await usuario.generateAuthToken()
        usuario.categoriacuota = categoriaCuota._id
        let rolIds = []
        let categoria

        for (let perfil of perfiles) {
            categoria = await Categoria.findOne({ '_id': perfil.categoria })
            rolIds = []
            for (let rolCod of perfil.roles) {
                rol = await Rol.findOne({ 'codigo': rolCod })

                if (rol.codigo === 'DEL') {
                    categoria.delegados.push(usuario._id)
                }
                if (rol.codigo === 'DTS') {
                    categoria.dts.push(usuario._id)
                }
                if (rol.codigo === 'TES') {
                    categoria.tesoreros.push(usuario._id)
                }
                if (rol.codigo === 'JUG') {
                    categoria.jugadores.push(usuario._id)
                }
                rolIds.push(rol._id)
            }
            perfil.roles = [...rolIds]
            categoria.save()
        }
        usuario.perfiles = [...perfiles]
        usuario.save()
        usuario.enviarConfirmacionAlta()
        res.header('x-auth', token).status(200).send({ usuario })
    } catch (e) {
        res.status(400).send(new ApiResponse({}, `Mensaje: ${e}`))
    }
})

api.post('/usuarios/login', async (req, res) => {

    try {
        let usuario = await Usuario.findByCredentials(req.body.email.toLowerCase(), req.body.password)

        if (usuario && usuario.activo) {

            res.status(200).send({ usuario });
        } else {
            res.status(404).send(new ApiResponse({}, 'Usuario y/o contraseña inválidos'));
        }

    } catch (e) {
        console.log('Error ',e)
        res.status(400).send(new ApiResponse({}, `Mensaje: ${e}`))
    }
})

api.put('/usuarios/perfiles', async (req, res) => {


    try {

        let usuario = await Usuario.findOne({ _id: req.body._id })

        usuario.perfiles = req.body.perfiles
        usuario.activo = req.body.activo




        if (!usuario.categoriaCuota || usuario.categoriacuota.toString() !== req.body.categoriacuota) {
            usuario.categoriacuota = req.body.categoriacuota
        }

        usuario = await usuario.save()

        let categorias = await Categoria.find({});

        for (let categoria of categorias ){
            
            if (categoria.delegados.indexOf(usuario._id) > -1) {
                categoria.delegados.splice(categoria.delegados.indexOf(usuario._id), 1)
            }
            if (categoria.dts.indexOf(usuario._id) > -1) {
                categoria.dts.splice(categoria.dts.indexOf(usuario._id), 1)
            }
            if (categoria.tesoreros.indexOf(usuario._id) > -1) {
                categoria.tesoreros.splice(categoria.tesoreros.indexOf(usuario._id), 1)
            }
            if (categoria.jugadores.indexOf(usuario._id) > -1) {
                categoria.jugadores.splice(categoria.jugadores.indexOf(usuario._id), 1)
            }

            await categoria.save();
        }

        


        for (let perfil of usuario.perfiles) {

            categoria = await Categoria.findOne({ '_id': perfil.categoria })

            



            for (let rolId of perfil.roles) {
                rol = await Rol.findOne({ '_id': rolId })

                if (rol.codigo === 'DEL') {
                    categoria.delegados.push(usuario._id)
                }
                if (rol.codigo === 'DTS') {
                    categoria.dts.push(usuario._id)
                }
                if (rol.codigo === 'TES') {
                    categoria.tesoreros.push(usuario._id)
                }
                if (rol.codigo === 'JUG') {
                    categoria.jugadores.push(usuario._id)
                }
            }

            await categoria.save()
        }




        res.status(200).send({ usuario })
    } catch (e) {
        console.log(e)
        res.status(400).send(new ApiResponse({}, `Mensaje: ${e}`))
    }
})

api.put('/usuarios/password', async (req, res) => {
    try {

        let password = req.body.nuevaPassword

        let usuario = await Usuario.findOneAndUpdate({ _id: ObjectID(req.body.usuario._id) }, { $set: { password } })

        if (usuario) {
            usuario.tokens = []
            usuario = await usuario.save()
            usuario.generateAuthToken()
            res.send(new ApiResponse({ text: 'Cambio exitoso' }))
        } else {
            res.status(404).send(new ApiResponse(undefined, { error: 'No existe el usuario' }))
        }
    }
    catch (e) {
        console.log(e)
        res.status(400).send(new ApiResponse(undefined, { error: 'Error al cambiar password' }))
    }
})

api.post('/usuarios/password', async (req, res) => {
    try {

        let email = req.body.email

        let usuario = await Usuario.findOne({email})

        if (usuario) {
            usuario.enviarCorreoRecupero()
            res.send(new ApiResponse({ text: 'Solicitud correcta' }))
        } else {
            res.status(404).send(new ApiResponse(undefined, { error: 'No existe el usuario' }))
        }
    }
    catch (e) {
        console.log(e)
        res.status(400).send(new ApiResponse(undefined, { error: 'Ha ocurrido un problema' }))
    }
})


api.put('/usuarios/:id/push', async (req, res) => {

    let _id = req.params.id;
    let platform = req.body.platform
    let token = req.body.token
    
    try {
        let usuario = await Usuario.findOne({ _id })
        if (usuario) {
            if (!usuario.tokens.find((obj) => obj.access === platform)) {
                usuario.tokens = usuario.tokens.concat([{ access: platform, token: req.body.token }])
                usuario = await usuario.save()
                res.status(200).send(new ApiResponse({}, 'Se guardo token correctamente'))
            } else {
                for (let obj of usuario.tokens) {
                    if (obj.access === platform) {
                        obj.token = token
                    }
                }
                usuario = await usuario.save()
                res.status(200).send(new ApiResponse({}, 'Se guardo token correctamente'))
            }

        } else {
            res.status(404).send()
        }
    } catch (e) {
        console.log(e)
        res.status(400).send(new ApiResponse({}, 'Error'))
    }
})

api.put('/usuarios/:id/unpush', async (req, res) => {

    let _id = req.params.id;
    let platform = req.body.platform

    try {
        let usuario = await Usuario.findOne({ _id })
        if (usuario) {
            let pos = -1
            for (let i = 0; i < usuario.tokens.length; i++) {
               
                if (usuario.tokens[i].access === platform) {
                    pos = i
                }
            }
         
            if (pos >= 0) { usuario.tokens.splice(pos, 1) }
            usuario = await usuario.save()
            res.status(200).send(new ApiResponse({}, 'Se quito token correctamente'))


        } else {
            res.status(404).send()
        }
    } catch (e) {
        console.log(e)
        res.status(400).send(new ApiResponse({}, 'Error'))
    }
})

api.put('/usuarios/:id', async (req, res) => {
    let token = req.header('x-auth')
    

    try {
        let usuarioRequest = await Usuario.findByToken(token)
        if (!usuarioRequest) {
            res.status(401).send(new ApiResponse({}, 'No autorizado'))
        }

        let _id = req.params.id;
        let usu = await Usuario.findOne({_id})
        
        req.body.perfiles = usu.perfiles
    
        let usuario = await Usuario.findOneAndUpdate({ _id }, { $set: req.body })
      
         usuario = await Usuario.findOne({_id})
        if (!usuario) {
            res.status(401).send(new ApiResponse({}, 'Usuario inválido'))
        }

        res.status(200).send(new ApiResponse(usuario))
    }
    catch (err) {
        console.log(err)
        res.status(400).send(new ApiResponse({}, err))
    }

})

api.get('/usuarios/confirmacion/:token', async (req, res) => {
    let token = req.params.token;
    try {
        let usuario = await Usuario.findByToken(token)
        if (usuario) {
            res.status(200).send(new ApiResponse({ usuario }));
        }
        else {
            res.send(new ApiResponse({}, 'No existe usuario con ese token.'))
        }
    } catch (e) {
        res.status(400).send(e)
    }

})



module.exports = api;