require('./config/config')
const express = require('express')
const bodyParser = require('body-parser')
const { mongoose } = require('./db/mongoose')
const pantallasRuta = require('./routes/pantalla-rutas');
const rolesRuta = require('./routes/rol-rutas');
const UsuariosRuta = require('./routes/usuario-rutas');
const CategoriaRuta = require('./routes/categoria-rutas');
const ConceptosCaja = require('./routes/conceptosCaja-rutas');
const { scriptInicial } = require('./Utilidades/script-inicial');
const tipoEvento = require('./routes/tipoEvento-rutas');
const cors = require('cors')
const cuentaRuta = require('./routes/cuenta-rutas');
const pagosRuta = require('./routes/pagos-rutas');
const eventoRuta = require('./routes/evento-rutas');
const fixtureRuta = require('./routes/fixture-rutas');
const { autenticacion } = require('./middlewares/autenticacion')


const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb' }));

const port = process.env.PORT

app.use(bodyParser.json())

app.use('/api', autenticacion)
app.use('/api', pantallasRuta);
app.use('/api', rolesRuta);
app.use('/api', UsuariosRuta);
app.use('/api', CategoriaRuta);
app.use('/api', ConceptosCaja)
app.use('/api', tipoEvento);
app.use('/api', cuentaRuta);
app.use('/api', pagosRuta);
app.use('/api', eventoRuta);
app.use('/api', fixtureRuta);

let ruta = __dirname
ruta = ruta.substring(0, ruta.length - 6) + 'www'

app.use(express.static(ruta))

app.listen(port, () => {
    console.log(`Started up at port ${port}`)

})

try {
    scriptInicial()
    var http = require("http");
    let awake = 'S'
    awake = process.env.AWAKE
    if (awake === 'S') {
        console.log('awake mode on')
        setInterval(function () {
            try {
                http.get(process.env.URLAPP)
            } catch (e) {
                console.log(e)
            }
        }, 600000);
    } else {
        console.log('awake mode off')
    }
} catch (e) {
    console.log(e)
}





module.exports = { app }