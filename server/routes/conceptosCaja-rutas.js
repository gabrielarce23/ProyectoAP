var express = require('express');
var api= express.Router();
const {ConceptosCaja}=require('../models/conceptosCaja')
const _ = require('lodash')
const {ApiResponse} = require('../models/api-response')

api.get('/conceptosCaja',(req, res)=>{
    
    ConceptosCaja.find()
    .then((conceptosCaja)=>{
        res.status(200).send(new ApiResponse({conceptosCaja},''))
    }),(e)=>{
        res.status(400).send(new ApiResponse({},"Error al obtener datos."))
    }
})


api.get('/conceptosCaja/:id', async (req,res)=>{
    var id = req.params.id;
    
    if(!ObjectID.isValid(id)){
        res.status(404).send(new ApiResponse({},"Código de Id inválido."))
    }

    ConceptosCaja.findOne({
        _id: id
    }).then((conceptosCaja)=> {
        if(conceptosCaja){
            res.status(200).send(new ApiResponse({conceptosCaja},''))
        }else{
            res.status(404).send(new ApiResponse({},"No hay datos para mostrar."))
        }
    }).catch((e)=>{
        res.status(400).send(new ApiResponse({e},"Error"))
    })    
})

api.post('/conceptosCaja', async (req,res) =>{
    
    try{
        var conceptoCaja = new ConceptosCaja(_.pick(req.body,['nombre','tipo']))
        await conceptoCaja.save()
       
        res.status(200).send(new ApiResponse({mensaje : 'Agregado ok'},''));
    }catch(e){
        res.status(400).send(new ApiResponse({},"No se pudo agregar el concepto de caja."))
    }
})

api.put('/conceptosCaja/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['nombre','tipo']);

    ConceptosCaja.findOneAndUpdate({
        _id: id
    }, {
            $set: body
        }, {
            new: true
        }).then((conceptoCaja) => {
            if (conceptoCaja) {
                res.status(200).send(new ApiResponse({mensaje : 'Modificado OK.'},''));
            } else {
                res.status(404).send(new ApiResponse({},"No se encontró un concepto para modificar."))
            }
        }).catch((e) => {
            res.status(400).send(new ApiResponse({e},"Error al modificar. Revisar datos ingresados."))
        })
})


module.exports=api;