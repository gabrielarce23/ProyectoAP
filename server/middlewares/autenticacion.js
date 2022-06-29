var {Usuario} = require('./../models/usuario')

const validEndpoints = [
    {
        method: '*',
        url: '/usuarios/login'
    },
    {
        method: 'POST',
        url: '/usuarios/password'
    }
]

var autenticacion = (req, res, next) => {

    const valid = !!validEndpoints.find(e => {
        const validMethod = e.method === '*' || e.method === req.method
        const validUrl = e.url === req.url
        return validMethod && validUrl
    })

    if(valid){
      
        next()
    }else{
        var token = req.header('x-auth')
      
        Usuario.findByToken(token).then((usuario) => {
            
            if (!usuario) {
                return Promise.reject()
            }
            req.usuarioRequest = usuario
            next()
        }).catch((e) => {
            res.status(401).send()
        })

    }

}

module.exports = {
    autenticacion
}