var express = require('express');
var api= express.Router();
const {Usuario}=require('../models/usuario')
const _ = require('lodash')

api.get('/usuarios',(req, res)=>{
    Usuario.find()
    .then((usuarios)=>{
        res.send({usuarios})
    }),(e)=>{
        res.status(400).send(e)
    }
})

api.post('/usuarios', async (req,res) =>{
    
    try{
        console.log('aca')
        var usuario = new Usuario(_.pick(req.body,['nombre','apellido','email']))
        await usuario.save()
        console.log('aca2')
        const token = await usuario.generateAuthToken()
        res.header('x-auth',token).status(200).send({"mensaje":"Usuario ok"});
    }catch(e){
        res.status(400).send(e)
    }
})



module.exports=api;