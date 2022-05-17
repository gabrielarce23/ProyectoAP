var express = require('express');
var api = express.Router();
const { Cuenta } = require('../models/cuenta')
const { Usuario } = require('../models/usuario')
const { ConceptosCaja } = require('../models/conceptosCaja')
const { Categoria } = require('../models/categoria')
const _ = require('lodash')
const { ObjectID } = require('mongodb')
const { ApiResponse } = require('../models/api-response')
var { enviarNotificacion, enviarCorreoNotificacion } = require('../Utilidades/utilidades')

var infoUsuario = 'nombre apellido email perfiles ci celular direccion fechaVtoCarneSalud delegadoInstitucional fechaNacimiento'
infoUsuario += ' fechaUltimoExamen requiereExamen emergencia notificacionEmail sociedad contacto posiciones activo perfiles categoriacuota ultimoMesCobrado cuenta cuotaEspecial valorCuota'


api.get('/cuenta/:_id', async (req, res) => {
    let id = req.params._id;

    Cuenta.findOne({
        _id: id
    })
        .then((cuenta) => {
            if (cuenta) {
                res.status(200).send(new ApiResponse({ cuenta }))
            } else {
                res.status(404).send(new ApiResponse({}, "No hay datos para mostrar"));
            }
        }).catch((e) => {
            res.status(400).send(new ApiResponse({}, `Mensaje: ${e}`))
        })
})

api.get('/movimientospendientes/:id', async (req, res) => {
    let id = req.params.id;
    movimientos = []

    Cuenta.findOne({
        _id: id
    })
        .then(async (cuenta) => {
            if (cuenta) {
                for (let mov of cuenta.movimientos) {
                    if (mov.confirmado == false) {
                        let usuario = await Usuario.findById(mov.usuario)
                        mov.usuario = usuario
                        movimientos.push(mov);

                    }
                }
                res.status(200).send(new ApiResponse({ movimientos }))
            } else {
                res.status(404).send(new ApiResponse({}, "No hay datos para mostrar"));
            }
        }).catch((e) => {
            res.status(400).send(new ApiResponse({}, `Mensaje: ${e}`))
        })

})

api.get('/movimientos/:id', async (req, res) => {

    try {
        let cta = await Cuenta.findById(req.params.id);
        if (cta) {
            let movs = [...cta.movimientos]
            movs.sort( (a,b) => a.fecha > b.fecha ? -1 : 1);
            if (req.query.tipo) {
                movs = movs.filter((mov) => {
                    return mov.tipo === req.query.tipo
                })
            }
            if (req.query.concepto) {
                movs = movs.filter((mov) => {

                    idconcepto = ObjectID(req.query.concepto)

                    return mov.concepto.toString() === idconcepto.toString()
                })
            }
            if (req.query.fechaInicio) {
                movs = movs.filter((mov) => {
                    return mov.fecha >= req.query.fechaInicio
                })
            }
            if (req.query.fechaFin) {
                movs = movs.filter((mov) => {
                    return mov.fecha <= req.query.fechaFin
                })
            }

            let movimientos = []

            for (let i = 0; i < movs.length; i++) {
                let movimiento = movs[i]._doc
                let concepto = await ConceptosCaja.findById(movimiento.concepto)

                movimiento.concepto = concepto.nombre
                let usuario = await Usuario.findById(movimiento.usuario)
                if(usuario) movimiento.usuario = usuario.nombre + ' ' + usuario.apellido
                movimientos.push(movimiento)


            }
            res.status(200).send(new ApiResponse({ movimientos }))
        }


    } catch (e) {
        console.log(e)
        res.status(400).send(new ApiResponse({}, `Mensaje: ${e}`))
    }

})

api.patch('/cuenta/:idCuenta/movimiento/:idMovimiento', async (req, res)=>{
    try{
        let cuenta = await Cuenta.findOne({_id:req.params.idCuenta})
        let idMovimiento = req.params.idMovimiento
        let monto
        for(let mov of cuenta.movimientos){
            if(mov._id.toString() === idMovimiento && mov.estado !== 'Anulado'){
                mov.estado= 'Anulado'
                cuenta.saldo = cuenta.saldo - parseInt(mov.monto)
                await cuenta.save()
                return res.send(new ApiResponse({cuenta}, 'Anulado correctamente'))
            }
        }
        res.status(404).send(new ApiResponse({},'Movimiento no econtrado'))


    }catch(e){
        console.log(e)
        res.status(400).send(new ApiResponse({},e))
    }
})

api.patch('/cuenta/movimientos/ingresomovimiento/:id', async (req, res) => {

    try {
        let idCuenta = req.params.id;
        let movimiento = req.body.movimiento;

        let cuenta = await Cuenta.findById(idCuenta).populate('movimientos').exec();


        let nuevoSaldo = cuenta.saldo + parseInt(movimiento.monto);

        let movimientosActualizados = cuenta.movimientos;
        movimientosActualizados.push(movimiento);

        Cuenta.findOneAndUpdate({
            _id: idCuenta
        }, {
                $set: { saldo: nuevoSaldo, movimientos: movimientosActualizados }
            }, {
                new: true
            }).then((cuenta) => {
                if (cuenta) {
                    res.status(200).send(new ApiResponse({ cuenta }));
                } else {
                    res.status(404).send(new ApiResponse({}, "Ocurrió un error al agregar el movimiento"))
                }
            }).catch((e) => {
                res.status(400).send(new ApiResponse({}, "400-Ocurrió un error al agregar el movimiento"))
            })
    } catch (e) {
        res.status(400).send(new ApiResponse({}, `Mensaje: ${e}`))
    }
})

api.patch('/cuenta/transferencia/:id', async (req, res) => {
    // en el body viene el movimiento, idCuenta (destino), IdCategoria
    try {
        let cuentaOrigen = await Cuenta.findById(req.params.id).populate('movimientos').exec()
        let cuentaDestino = await Cuenta.findById(req.body.idcuenta).populate('movimientos').exec();
        let movimiento = req.body.movimiento;
        let conceptoDestino = await ConceptosCaja.findOne({nombre: 'Ingreso Transf. Saldos'})
        let categoriaDestino = await Categoria.findById(req.body.idcategoria).populate('tesoreros').exec()
    console.log(movimiento.monto)
        let nuevoSaldoCtaOrigen = cuentaOrigen.saldo + parseInt(movimiento.monto);
        let nuevoSaldoCtaDestino = cuentaDestino.saldo - parseInt(movimiento.monto);

        let movsCtaOrigen = cuentaOrigen.movimientos;
        movsCtaOrigen.push(movimiento);

        let movsCtaDestino = cuentaDestino.movimientos;
        movimientoDest = {...movimiento}
        movimientoDest.concepto = conceptoDestino._id
        movimientoDest.monto = movimientoDest.monto * (-1)
        movimientoDest.tipo = 'Ingreso'
        movsCtaDestino.push(movimientoDest);


        await Cuenta.findOneAndUpdate({
            _id: cuentaOrigen._id
        }, {
                $set: { saldo: nuevoSaldoCtaOrigen, movimientos: movsCtaOrigen }
            }, {
                new: true
            })
        await Cuenta.findOneAndUpdate({
            _id: cuentaDestino._id
        }, {
                $set: { saldo: nuevoSaldoCtaDestino, movimientos: movsCtaDestino }
            }, {
                new: true
            })

        for (let t of categoriaDestino.tesoreros) {
            tituloNot = `Transferencia entre categorías`
            bodyNot = `Hola ${t.nombre}! Se registró una transferencia a la categoria ${categoriaDestino.nombre}. Ingresá a la App para visualizar el movimiento.`
            if (t.hasMobileToken()) {
                enviarNotificacion(t, tituloNot, bodyNot)
            }
            else {
                enviarCorreoNotificacion(t, tituloNot, bodyNot)
                if(t.tokens.length > 1){
                    enviarNotificacion(t, tituloNot, bodyNot)
                }
            }
        }
        res.status(200).send(new ApiResponse({ cuentaOrigen }));
    } catch (e) {
        res.status(400).send(new ApiResponse({}, `Mensaje: ${e}`))
    }
})


api.post('/movimientos/:id', async (req, res) => {

    try {

        let cta = await Cuenta.findById(req.params.id);
        if (cta) {
            let movs = [...cta.movimientos]
            movs.sort( (a,b) => a.fecha > b.fecha ? -1 : 1);
            if (req.body.conceptos) {
                movs = movs.filter((mov) => {
                    return req.body.conceptos.includes(mov.concepto.toString())
                })
            }

            if (req.body.fechaInicio) {
                movs = movs.filter((mov) => {
                    return mov.fecha >= req.body.fechaInicio
                })
            }
            if (req.body.fechaFin) {
                movs = movs.filter((mov) => {
                    return mov.fecha <= req.body.fechaFin
                })
            }

            let movimientos = []

            for (let i = 0; i < movs.length; i++) {
                let movimiento = movs[i]._doc
                let concepto = await ConceptosCaja.findById(movimiento.concepto)

                movimiento.concepto = concepto.nombre
                let usuario = await Usuario.findById(movimiento.usuario)
                if(usuario) movimiento.usuario = usuario.nombre + ' ' + usuario.apellido
                movimientos.push(movimiento)


            }

            res.status(200).send(new ApiResponse({ movimientos }))
        }


    } catch (e) {
        console.log(e)
        res.status(400).send(new ApiResponse({}, `Mensaje: ${e}`))
    }

})


module.exports = api;
