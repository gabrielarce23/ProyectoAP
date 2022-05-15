var express = require('express');
var api = express.Router();
const { Campeonato } = require('../models/campeonato')
const { Evento } = require('../models/evento')
const { Categoria } = require('../models/categoria')
const { Usuario } = require('../models/usuario')
const { TipoEvento } = require('../models/tipoEvento')
const { Fecha } = require('../models/fecha')
const _ = require('lodash')
const { ApiResponse } = require('../models/api-response')
const { ObjectID } = require('mongodb')
var { enviarNotificacion , enviarCorreoNotificacion} = require('../Utilidades/utilidades')

api.get('/campeonatos', (req, res) => {
    Campeonato.find()
        .populate('fechas')
        .populate('categoria')
        .then((campeonatos) => {
            res.status(200).send(new ApiResponse({ campeonatos }))
        }), (e) => {
            res.status(400).send(new ApiResponse({}, `Mensaje: ${e}`))
        }
})

api.post('/campeonato/evento', async (req, res) => {
    try {

        let fecha = req.body.fecha
        let categoriaId = req.body.categoriaId
        let evento = new Evento()
        if (fecha.partido.local === true) {
            evento.nombre = `Fecha ${fecha.numeroFecha} CEI vs ${fecha.partido.rival}`
        } else {
            evento.nombre = `Fecha ${fecha.numeroFecha} ${fecha.partido.rival} vs CEI`
        }

        evento.fecha = fecha.fechaEncuentro
        evento.rival = fecha.partido.rival
        evento.lugar = fecha.partido.lugar

        let tipoEvento = await TipoEvento.findOne({ nombre: "Partido Oficial" })
        evento.tipoEvento = tipoEvento
        let categoria = await Categoria.findOne({ _id: categoriaId })
        evento.categoria = categoria._id

        let invitados = [
            ...categoria.delegados,
            ...categoria.jugadores,
            ...categoria.tesoreros,
            ...categoria.dts
        ]

        evento.invitados = []
        for (let invitado of invitados) {
            if (evento.invitados.indexOf(invitado) < 0) {
                evento.invitados.push(invitado)
            }
        }



        evento = await evento.save()

        if (evento) {

            for (let invitado of evento.invitados) {
                let user = await Usuario.findOne({ _id: invitado })
                tituloNot = `Nuevo evento: ${evento.nombre}`
                bodyNot = `Hola ${user.nombre}! Has sido invitado a un nuevo evento. Por favor, consultá los detalles y confirmá asistencia. Gracias!`
                if (user.hasMobileToken()) {

                    enviarNotificacion(user, tituloNot, bodyNot)
                } else {
                    enviarCorreoNotificacion(user, tituloNot, bodyNot)
                    if(user.tokens.length > 1){
                        enviarNotificacion(user, tituloNot, bodyNot)
                    }
                }

            }
            res.send(new ApiResponse({}, ''))
        } else {
            res.status(400).send(new ApiResponse({}, 'Error al crear el evento'))
        }



    } catch (e) {
        console.log(e)
        res.status(400).send(new ApiResponse({}, 'Error al crear el evento'))
    }
})

api.post('/campeonato/:id/agregarfecha', async (req, res) => {

    let id = req.params.id
    try {
        let campeonato = await Campeonato.findById({ _id: id }).populate('fechas');
        let f = new Fecha(_.pick(req.body, ['numeroFecha',
            'fechaEncuentro', 'rueda', 'partido']))

        let fecha = new Fecha()
        if (campeonato) {

            for (let fecha of campeonato.fechas) {

                if (fecha.numeroFecha === f.numeroFecha && fecha.rueda === f.rueda) {
                    return res.status(400).send(new ApiResponse({},
                        "No se agregó. Ya existe el número de fecha"));
                }
            }
            campeonato.fechas.push(f)
            let fecha = await f.save()
            await campeonato.save()

            return res.status(200).send(new ApiResponse(fecha));
        } else {
            res.status(404).send(new ApiResponse({}, "No hay datos para mostrar"));
        }
    } catch (e) {
        console.log(e)
        res.status(400).send(new ApiResponse({}, `Mensaje: ${e}`))
    }
})

api.post('/campeonato', async (req, res) => {

    try {

        let nombre = req.body.nombre;
        let anio = req.body.anio;
        let fechas = req.body.fechas;
        let categoria = req.body.categoria._id;

        let campeonato = new Campeonato({ nombre, anio, fechas, categoria })
        campeonato = await campeonato.save();

        cat = await Categoria.findById(categoria)
        cat.campeonatos.push(campeonato)
        await cat.save();

        return res.status(200).send(new ApiResponse(campeonato));

    } catch (e) {
        console.log(e)
        res.status(400).send(new ApiResponse({}, `Mensaje: ${e}`))
    }
})

api.put('/campeonato/:idfecha/modificarfecha', async (req, res) => {

    try {
        let id = req.params.idfecha
        let fecha = await Fecha.findOneAndUpdate({ _id: id }, req.body)
        if (fecha) {
            return res.status(200).send(new ApiResponse(fecha));
        } else {
            res.status(404).send(new ApiResponse({}, "Ocurrió un error al modificar"));
        }
    } catch (e) {
        console.log(e)
        res.status(400).send(new ApiResponse({}, `Mensaje: ${e}`))
    }
})

api.put('/campeonato/:id', async (req, res) => {

    try {
        let id = req.params.id
        let campeonato = await Campeonato.findOneAndUpdate({ _id: id }, req.body)
        if (campeonato) {
            return res.status(200).send(new ApiResponse(campeonato));
        } else {
            res.status(404).send(new ApiResponse({}, "Ocurrió un error al modificar"));
        }
    } catch (e) {
        console.log(e)
        res.status(400).send(new ApiResponse({}, `Mensaje: ${e}`))
    }
})

api.get('/campeonato/:_id', (req, res) => {
    let id = req.params._id;

    Campeonato.findOne({
        _id: id
    }).populate('fechas')
        .then((campeonato) => {
            if (campeonato) {
                res.status(200).send(new ApiResponse({ campeonato }))
            } else {
                res.status(404).send(new ApiResponse({}, "No hay datos para mostrar"));
            }
        }).catch((e) => {
            res.status(400).send(new ApiResponse({}, `Mensaje: ${e}`))
        })
})

api.get('/fecha/:_id', (req, res) => {
    let id = req.params._id;

    Fecha.findOne({
        _id: id
    })
        .then((fecha) => {
            if (fecha) {
                res.status(200).send(new ApiResponse({ fecha }))
            } else {
                res.status(404).send(new ApiResponse({}, "No hay datos para mostrar"));
            }
        }).catch((e) => {
            res.status(400).send(new ApiResponse({}, `Mensaje: ${e}`))
        })
})

module.exports = api;
