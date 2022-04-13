var mongoose = require('mongoose')

var EventoSchema = mongoose.Schema({
    fecha: {
        type: Number,
        required: true
    },
    nombre: {
        type: String,
        required: true,
        maxlengt: 20
    },
    tipoEvento: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TipoEvento',
        required: true
    },
    lugar: {
        nombre: {
            type: String
        },
        direccion: {
            type: String
        },
        linkUbicacion: {
            type: String
        }
    },
    rival: {
        type: String
    },
    invitados: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }],
    confirmados: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }],
    noAsisten: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }],
    duda: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }],
    registrosDT: [{
        jugadorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario'
        },
        comentario: {
            type: String
        }
    }],
    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categoria',
        require: true
    },
    imagenQR: {
        type: String
    }
})

var Evento = mongoose.model('Evento', EventoSchema)
module.exports = { Evento }