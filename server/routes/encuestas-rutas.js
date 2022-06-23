var express = require('express');
var api = express.Router();
const _ = require('lodash')
const { ApiResponse } = require('../models/api-response')
const { Encuesta } = require('../models/encuesta');
const { ObjectID } = require('mongodb')

api.get('/encuestas', async (req, res) => {

    try {
        const userId = req.usuarioRequest._id
        let encuestas = await Encuesta.find({$or:[{"activa": true},{"veedores":{$in: [ObjectID(userId)]}}]})
        
        const encuestasData = encuestas.map(e => {
            const {nombre, habilitados, veedores, activa, limite, _id, opciones, extraInfo} = e
            const voto = e.votos.find(voto => voto.usuario._id.toString() === userId.toString()) 
            return {nombre, habilitados, veedores, activa, limite, _id, opciones, extraInfo, voto}
        })
        
        res.status(200).send(new ApiResponse({ encuestas: encuestasData }))
    } catch (e) {
        res.status(400).send(new ApiResponse({}, `Error al obtener datos: ${e}`))
    }
})


api.get('/encuestas/:id/voto', async (req, res) => {

    try {
        let _id = req.params.id;
        let encuesta = await Encuesta.findOne({ _id })

        if(!encuesta) {
            return res.status(404).send(new ApiResponse({}, "No existe encuesta con ese id"))
        }
        
        let esVeedor = !!encuesta.veedores.find(u => u.toString() === u._id.toString())
        if(!esVeedor) {
            return res.status(401).send(new ApiResponse({}, "No eres veedor para esta encuesta"))
        }

        return res.status(200).send(new ApiResponse({votos: encuesta.votos.map(v => v.opcion)}))

    } catch (e) {
        res.status(400).send(new ApiResponse({}, "No se pudo procesar el voto"))
        console.log(e);

    }
})

api.put('/encuestas/:id/voto', async (req, res) => {

    try {
        let _id = req.params.id;
        let usuario = {_id: req.usuarioRequest._id}
        let opcionElegida = req.body.voto
        let encuesta = await Encuesta.findOne({ _id })

        if(!encuesta || !encuesta.activa) {
            return res.status(404).send(new ApiResponse({}, "No existe encuesta activa con ese id"))
        }
        
        let estaHablitado = !!encuesta.habilitados.find(u => u.toString() === u._id.toString())
        if(!estaHablitado) {
            return res.status(401).send(new ApiResponse({}, "No estás habilitado para esta encuesta"))
        }

        const votoValido = !!encuesta.opciones.find(o => o._id.toString() === opcionElegida.toString())
        if(!votoValido) {
            return res.status(400).send(new ApiResponse({}, "Voto no válido"))
        }

        const indiceVoto = encuesta.votos.findIndex(voto => voto.usuario._id.toString() === usuario._id.toString()) 
        if(indiceVoto >= 0) {
            encuesta.votos[indiceVoto].opcion = opcionElegida; 
        } else {
            encuesta.votos.push({opcion: opcionElegida, usuario: usuario})
        }

        await encuesta.save()

        return res.status(200).send(new ApiResponse({}, "Voto ingresado"))

    } catch (e) {
        res.status(400).send(new ApiResponse({}, "No se pudo procesar el voto"))
        console.log(e);

    }
})

module.exports = api;