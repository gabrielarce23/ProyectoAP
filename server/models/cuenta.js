var mongoose = require('mongoose')
const tiposmovimientos= ["Ingreso", "Egreso"];

var CuentaSchema = mongoose.Schema({
    movimientos: [{
        fecha: {
            type: String,
            required: true,
            trim: true
        },
        monto: {
            type: Number,
            required: true,
            trim: true,
        },
        tipo: {
            type: String,
            enum: tiposmovimientos,
            require: true
        },
        concepto:{
            type: mongoose.Schema.Types.ObjectId,
            require: true
        },
        comentario:{
            type: String,
            trim: true
        },
        usuario:{
            type: mongoose.Schema.Types.ObjectId,
            require: true
        }
    }],
    saldo: {
        type: Number,
        required: true,
        trim: true,
    },
    categoria:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Categoria'
    }
})

var Cuenta = mongoose.model('Cuenta',CuentaSchema)
module.exports = {Cuenta}