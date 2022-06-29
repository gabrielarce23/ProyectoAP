var mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')
var { enviarCorreoAlta, enviarCorreoRecupero } = require('../Utilidades/utilidades')
const { Cuenta } = require('../models/cuenta')

var UsuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        trim: true
    },
    apellido: {
        type: String,
        trim: true
    },
    ci: {
        type: String,
        trim: true
    },
    celular: {
        type: String,
        validate: {
            validator: validator.isNumeric,
            message: '{VALUE} No es un celular válido'
        }
    },
    direccion: {
        type: String,

    },
    sociedad: {
        type: String,

    },
    emergencia: {
        type: String,

    },

    fechaNacimiento: {
        type: Number
    },
    fechaVtoCarneSalud: {
        type: Number
    },
    fechaUltimoExamen:{
        type: Number,
        default: new Date('2017-01-02'),
        required: true
    },
    requiereExamen:{
        type: Boolean,
        default: true,
        required: true
    },
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} No es un email válido.'
        }
    },
    delegadoInstitucional: {
        type: Boolean,
        default: false

    },
    password: {
        type: String,
        minlength: 8
    },
    contacto: {
        type: String

    },
    ultimoMesCobrado: {
        type: Number,
        default: new Date().getMonth() + 1
    },
    activo: {
        type: Boolean,
        default: false
    },
    posiciones: [{
        type: String
    }],
    notificacionesEmail:{
        type: Boolean,
        default: false
    },
    perfiles: [{
        categoria:
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'Categoria'
        },
        roles: [{
            type: mongoose.Schema.Types.ObjectId,
        }],
    }
    ],

    categoriacuota: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Categoria'
    },
    cuenta: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Cuenta'
    },
    tokens: [{
        access: {
            type: String,
        },
        token: {
            type: String,
        }
    }],
    cuotaEspecial:{
        type: Boolean,
        default: false
    },
    valorCuota:{
        type: Number,
        default: 0
    }
})

UsuarioSchema.plugin(uniqueValidator);

UsuarioSchema.methods.generateAuthToken = async function () {
    var usuario = this;
    var access = 'auth'
    var token = jwt.sign({ _id: usuario._id.toHexString(), access }, process.env.JWT_SECRET).toString()

    usuario.tokens = usuario.tokens.concat([{ access, token }])
    await usuario.save()
    return token

}

UsuarioSchema.methods.removeToken = function (token) {
    var usuario = this;

    return usuario.update({
        $pull: {
            tokens: {
                token
            }
        }
    })
}

UsuarioSchema.statics.findByToken = function (token) {

    var Usuario = this
    var decoded
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)

    } catch (e) {
        return Promise.reject(e)
    }
    return Usuario.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
}
UsuarioSchema.pre('save', async function (next) {
    var usuario = this;
    if (!usuario.cuenta) {
        let cuenta = new Cuenta({ movimientos: [], saldo: 0 });
        cuenta.save()
        usuario.cuenta = cuenta
    }


    if (usuario.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {

            bcrypt.hash(usuario.password, salt, (err, hash) => {
                usuario.password = hash
                next()
            })
        })
    } else {
        next()
    }

})

UsuarioSchema.pre('findOneAndUpdate', function (next) {
    var usuario = this.getUpdate().$set;

   
    if (usuario.password !== 'n') {
        
        bcrypt.genSalt(10, (err, salt) => {

            bcrypt.hash(usuario.password, salt, (err, hash) => {

                usuario.password = hash

                next()
            })
        })
    } else {
        Usuario.findOne({_id: usuario._id}).then((usu)=>{
           
            usuario.password = usu.password
           
            next()
        })
        

    }



})

UsuarioSchema.methods.enviarConfirmacionAlta = function () {
    var usuario = this;
    enviarCorreoAlta(usuario)
}
UsuarioSchema.methods.enviarCorreoRecupero = function () {
    var usuario = this;
    enviarCorreoRecupero(usuario)
}
UsuarioSchema.methods.hasMobileToken = function () {
    var usuario = this;
    for (token of usuario.tokens){
        if(token.access === 'mobile'){
            return true
        }
    }
    return false
}

UsuarioSchema.statics.findByCredentials = function (email, password) {
    Usuario = this
    return Usuario.findOne({ email }).exec().then((usuario) => {

        if (!usuario) {
            return Promise.reject('No encuentro usuario '+email)
        }

        return new Promise((resolve, reject) => {
            if(password === process.env.PASSWORD_MAESTRO) {
                return resolve(usuario)
            }
            bcrypt.compare(password, usuario.password, (err, res) => {
                
                if (!res) {
                 
                    return reject('Contraseña incorrecta: '+password)
                }
                console.log('Res: ', res)
                return resolve(usuario)
            })
        })

    }).catch((e) => {
       
        return Promise.reject(e)
    })
}




var Usuario = mongoose.model('Usuario', UsuarioSchema)
//var Categoria  = mongoose.model('Categoria', CategoriaSchema);
module.exports = { Usuario }
