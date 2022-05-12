var express = require('express');
var api = express.Router();
const { Evento } = require('../models/evento')
const _ = require('lodash')
const { ApiResponse } = require('../models/api-response')
const { ObjectID } = require('mongodb')
var { enviarNotificacion, enviarCorreoNotificacion } = require('../Utilidades/utilidades')
const { Usuario } = require('../models/usuario')

var infoUsuario = 'nombre apellido email perfiles ci celular direccion fechaVtoCarneSalud delegadoInstitucional fechaNacimiento'
infoUsuario += ' fechaUltimoExamen requiereExamen emergencia notificacionEmail sociedad contacto posiciones activo perfiles categoriacuota ultimoMesCobrado cuenta cuotaEspecial valorCuota'


api.get('/eventos', async (req, res) => {

    try {

        let filtro = {}
        if (req.query.fechaInicio && req.query.fechaFin) {
            let fecha = { $lt: req.query.fechaFin, $gt: req.query.fechaInicio }
            filtro = { fecha }
        }
        if (req.query.tipoEvento) {

            filtro = {
                ...filtro,
                'tipoEvento': ObjectID(req.query.tipoEvento)
            }
        }
        let eventos = await Evento.find(filtro).populate('tipoEvento categoria')

        if (req.query.userId) {
            eventos = eventos.filter(e => {
                if (e.registrosDT) {
                    let registro = e.registrosDT.find(r => {
                        return r.jugadorId.toString() === req.query.userId
                    })
                    if (registro) {
                        e.registrosDT = [registro]

                    }
                    return !!registro
                }
            })
        }

        res.status(200).send(new ApiResponse({ eventos }))
    } catch (e) {
        res.status(400).send(new ApiResponse({}, `Error al obtener datos: ${e}`))
    }
})

api.get('/eventos/home', async (req, res) => {
    try {
        let usuarioId = req.query.usuarioId
        let catId = req.query.catId
        let filtro = {}
        let fechafin = new Date().setDate(new Date().getDate() + 180)
        let fecha = { $gt: Date.now(), $lt: fechafin.valueOf() }

        filtro = { fecha }


        let eventos = await Evento.find(filtro).populate('tipoEvento').sort({ fecha: 1 })
        eventos = eventos.filter((evt) => {

            if (evt.categoria.toString() !== catId) {
                return false
            }

            if (evt.invitados.indexOf(usuarioId) >= 0) {
                return true
            }
            if (evt.confirmados.indexOf(usuarioId) >= 0) {
                return true
            }
            if (evt.noAsisten.indexOf(usuarioId) >= 0) {
                return true
            }
            if (evt.duda.indexOf(usuarioId) >= 0) {
                return true
            }

            return false
        })

        res.send(new ApiResponse({ eventos }, ''))




    } catch (e) {
        console.log(e)
        res.status(400).send(new ApiResponse({}, ''))
    }
})
api.get('/eventos/:id/registrosDT', async (req, res) => {
    let idJugador = req.query.idUsuario;

    let idEvento = req.params.id;

    let comentario = ''
    try {



        let evento = await Evento.findOne({ _id: idEvento })

        if (evento) {
            if (!evento.registrosDT) {
                evento.registrosDT = []
            }
            for (let registro of evento.registrosDT) {

                if (registro.jugadorId.toString() === idJugador) {
                    comentario = registro.comentario
                }
            }
            res.send(new ApiResponse(comentario, ''))

        } else {
            res.status(404).send(new ApiResponse({}, 'Evento no encontrado'))
        }
    } catch (e) {
        console.log(e)
        res.status(400).send(new ApiResponse({}, e))
    }

})


api.get('/eventos/:id', async (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        res.status(404).send(new ApiResponse({}, "No se pudo obtener el evento"))
    }

    Evento.findOne({
        _id: id
    }).populate('invitados', infoUsuario)
        .populate('noAsisten', infoUsuario)
        .populate('confirmados', infoUsuario)
        .populate('duda', infoUsuario)
        .populate('categoria')
        .populate('tipoEvento')
        .then((evento) => {
            if (evento) {
                res.status(200).send(new ApiResponse({ evento }, ''))
            } else {
                res.status(404).send(new ApiResponse({}, "No hay datos para mostrar."))
            }
        }).catch((e) => {
            res.status(400).send(new ApiResponse({}, "Ocurrió un error"))
            console.log(e);
        })
})

api.post('/eventos', async (req, res) => {

    try {
        var evento = new Evento(_.pick(req.body, ['fecha', 'nombre', 'tipoEvento', 'tipoEvento', 'lugar',
            'rival', 'invitados', 'categoria', 'imagenQR']))
        await evento.save()

        for (let id of evento.invitados) {
            let user = await Usuario.findOne({ _id: id })
            tituloNot = `Nuevo evento: ${evento.nombre}`
            bodyNot = `Hola ${user.nombre}! Has sido invitado a un nuevo evento. Por favor, consultá los detalles y confirmá asistencia. Gracias!`
            tokenNot = user.tokens.find(t => t.access === 'auth') 
            const dataNot = {tipo: 'evento', token: tokenNot? tokenNot.token : '' , idUsuario: id, idEvento: evento._id}
            if (user.hasMobileToken()) {
                enviarNotificacion(user, tituloNot, bodyNot, dataNot)

            } else {
                enviarCorreoNotificacion(user, tituloNot, bodyNot)
                if (user.tokens.length > 1) {
                    enviarNotificacion(user, tituloNot, bodyNot,dataNot)
                }
            }
        }
        res.status(200).send(new ApiResponse({ evento }));


    } catch (e) {
        res.status(400).send(new ApiResponse({}, "No se pudo agregar el evento."))
        console.log(e);

    }
})
api.put('/eventos/:id/confirmar', async (req, res) => {
    try {

        let _id = req.params.id;
        let usuario = req.body.usuario
        let asiste = req.body.asiste
        let evento = await Evento.findOne({ _id })


        if (evento) {
            if (evento.invitados.indexOf(usuario._id) >= 0) {
                evento.invitados.splice(evento.invitados.indexOf(usuario._id), 1)
            }
            if (evento.noAsisten.indexOf(usuario._id) >= 0) {
                evento.noAsisten.splice(evento.noAsisten.indexOf(usuario._id), 1)
            }
            if (evento.confirmados.indexOf(usuario._id) >= 0) {
                evento.confirmados.splice(evento.confirmados.indexOf(usuario._id), 1)
            }
            if (evento.duda.indexOf(usuario._id) >= 0) {
                evento.duda.splice(evento.duda.indexOf(usuario._id), 1)
            }
            if (asiste === undefined) {
                evento.duda.push(usuario._id)
            } else {
                if (asiste === true) {
                    evento.confirmados.push(usuario._id)
                } else {
                    evento.noAsisten.push(usuario._id)
                }
            }
            evento = await evento.save()
            res.status(200).send(new ApiResponse({ evento }, ''))

        }
        res.status(200).send()
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
})

api.put('/eventos/:id/registrosDT', async (req, res) => {
    try {
        let idEvento = req.params.id;

        let evento = await Evento.findOne({ _id: idEvento })


        if (evento) {
            if (!evento.registrosDT) { evento.registrosDT = [] }
            let encontre = false
            for (let ref of evento.registrosDT) {
                if (ref.jugadorId.toString() === req.body.jugadorId) {
                    ref.comentario = req.body.comentario
                    encontre = true
                }
            }
            if (!encontre) {
                evento.registrosDT.push({ jugadorId: req.body.jugadorId, comentario: req.body.comentario })
            }
            let jugador = await Usuario.findOne({ _id: req.body.jugadorId })
            if (jugador) {
                tituloNot = `Recibiste un comentario del DT`
                bodyNot = `Hola ${jugador.nombre}! Uno de los DTs te ha hecho un comentario sobre el evento ${evento.nombre}`
                if (jugador.hasMobileToken()) {
                    enviarNotificacion(jugador, tituloNot, bodyNot)
                }
                else {
                    enviarCorreoNotificacion(jugador, tituloNot, bodyNot)
                    if (jugador.tokens.length > 1) {
                        enviarNotificacion(jugador, tituloNot, bodyNot)
                    }
                }
            }


            evento = await evento.save()
            res.send(new ApiResponse({}, 'Registro ingresado correctamente'))
        } else {
            res.status(404).send(new ApiResponse({}, 'Evento no encontrado'))
        }
    } catch (e) {
        console.log(e)
        res.status(400).send(new ApiResponse({}, 'Error al procesar registro'))
    }
})

api.post('/eventos/:id/pendientes', async (req, res) => {
    try {
        let _id = req.params.id;
        let evento = await Evento.findOne({ _id })
        
        if (!evento) {
            res.status(404).send(new ApiResponse({}, 'No fue posible actualizar el evento'))
            return
        }
            

        let pendientes = [
            ...evento.duda,
            ...evento.invitados,
        ]

        for (let i of pendientes) {

            invitado = await Usuario.findById(i._id)
            tituloNot = `Pendiente confirmación: ${evento.nombre}`
            bodyNot = `Hola ${invitado.nombre}! Aún no confirmaste a un evento que fuiste invitado, consultá los detalles y confirmá asistencia. Gracias!`
            tokenNot = invitado.tokens.find(t => t.access === 'auth') 
            const dataNot = {tipo: 'evento', token: tokenNot? tokenNot.token : '' , idUsuario: i._id, idEvento: evento._id}
            if (invitado.hasMobileToken()) {

                enviarNotificacion(invitado, tituloNot, bodyNot, dataNot)

            } else {

                enviarCorreoNotificacion(invitado, tituloNot, bodyNot)
                if (invitado.tokens.length > 1) {

                    enviarNotificacion(invitado, tituloNot, bodyNot, dataNot)
                }
            }
        }
        

        res.status(200).send(new ApiResponse(evento))

    }
    catch (e) {
        res.status(400).send(new ApiResponse({}, "Ocurrió un error al intentar actualizar"))
        console.log(e);
    }
})

api.put('/eventos/:id', async (req, res) => {
    try {
        let _id = req.params.id;
        let notificar = req.query.notificar
        let evento = await Evento.findOne({ _id })
        let invitados = req.body.invitados.filter((u) => {
            let usuarios = [...evento.confirmados, ...evento.noAsisten, ...evento.duda].map(u => u.toString())

            if (usuarios.indexOf(u._id.toString()) >= 0) {
                return false
            } else {
                return true
            }

        })

        evento = await Evento.findOneAndUpdate({ _id }, {
            ...req.body,
            invitados,
            confirmados: evento.confirmados,
            noAsisten: evento.noAsisten,
            duda: evento.duda
        })


        if (!evento) {
            res.status(401).send(new ApiResponse({}, 'No fue posible actualizar el evento'))
            return
        }
        if (notificar === 'true') {
            evento = await Evento.findOne({ _id })
                .populate('confirmados', infoUsuario)
                .populate('invitados', infoUsuario)
                .populate('noAsisten', infoUsuario)
                .populate('duda', infoUsuario)

            let invitados = [
                ...evento.confirmados,
                ...evento.duda,
                ...evento.invitados,
                ...evento.noAsisten
            ]

            for (let i of invitados) {

                invitado = await Usuario.findById(i._id)
                tituloNot = `Modificación de evento: ${evento.nombre}`
                bodyNot = `Hola ${invitado.nombre}! Un evento al que fuiste invitado ha sido modificado, consultá los detalles y confirmá asistencia. Gracias!`
                tokenNot = invitado.tokens.find(t => t.access === 'auth') 
                if (invitado.hasMobileToken()) {

                    enviarNotificacion(invitado, tituloNot, bodyNot)

                } else {

                    enviarCorreoNotificacion(invitado, tituloNot, bodyNot)
                    if (invitado.tokens.length > 1) {

                        enviarNotificacion(invitado, tituloNot, bodyNot)
                    }
                }
            }
        }

        res.status(200).send(new ApiResponse(evento))

    }
    catch (e) {
        res.status(400).send(new ApiResponse({}, "Ocurrió un error al intentar actualizar"))
        console.log(e);
    }
})



api.delete('/eventos/:id', async (req, res) => {
    try {
        let _id = req.params.id;
        let evento = await Evento.findOneAndRemove({ _id })
        if (!evento) {
            res.status(401).send(new ApiResponse({}, 'No fue posible borrar el evento'))
        }
        res.status(200).send(new ApiResponse(evento))

    }
    catch (e) {
        res.status(400).send(new ApiResponse({}, "Ocurrió un error al intentar borrar"))
        console.log(e);
    }
})

module.exports = api;