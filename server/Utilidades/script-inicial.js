const { Rol } = require('../models/rol')
const { Pantalla } = require('../models/pantalla')
const { Usuario } = require('../models/usuario')
const { Categoria } = require('../models/categoria')
const { ConceptosCaja } = require('../models/conceptosCaja')
const { Cuenta } = require('../models/cuenta')
const { Movimiento } = require('../models/movimiento')
const {TipoEvento}=require('../models/tipoEvento')
var cron = require('node-cron');
var { enviarNotificacion,enviarCorreoNotificacion } = require('../Utilidades/utilidades')

const scriptInicial = async () => {
    await cargaRoles()
    await cargaPantallas()
    await cargaDelegadosI()
    await cargaConcepto()
    await batch()
    await cargaTipoEvento()
   // await cuotasBatch()
}

const cargaRoles = async () => {
    const roles = await Rol.find()
    if (roles.length === 0) {
        await new Rol({ 'nombre': 'Delegado', 'codigo': 'DEL' }).save()
        await new Rol({ 'nombre': 'DT', 'codigo': 'DTS' }).save()
        await new Rol({ 'nombre': 'Tesorero', 'codigo': 'TES' }).save()
        await new Rol({ 'nombre': 'Jugador', 'codigo': 'JUG' }).save()
        await new Rol({ 'nombre': 'Delegado Institucional', 'codigo': 'DIN' }).save()
    }



}

const cargaTipoEvento = async () =>{
    const tiposEvento = await TipoEvento.find()
    if(tiposEvento.length===0){
        await new TipoEvento({nombre: 'Partido Oficial', datosDeportivos: true}).save()
    }
}

const cargaConcepto = async () => {
    const conceptosCaja = await ConceptosCaja.find()
    if (conceptosCaja.length === 0) {
        await new ConceptosCaja({ nombre: 'Cobro de couta', tipo: 'Egreso' }).save()
        await new ConceptosCaja({ nombre: 'Pago de Cuota', tipo: 'Ingreso' }).save()
        await new ConceptosCaja({ nombre: 'Deuda Inicial', tipo: 'Egreso' }).save()
        await new ConceptosCaja({ nombre: 'Saldo Inicial', tipo: 'Ingreso' }).save()
        await new ConceptosCaja({ nombre: 'Transferencia de Saldos', tipo: 'Ingreso' }).save()
    }
}

const cargaPantallas = async () => {
    const pantallas = await Pantalla.find()
    const delegado = await Rol.findOne({ 'codigo': 'DEL' })
    const dt = await Rol.findOne({ 'codigo': 'DTS' })
    const tesorero = await Rol.findOne({ 'codigo': 'TES' })
    const jugador = await Rol.findOne({ 'codigo': 'JUG' })
    const delegadoInst = await Rol.findOne({ 'codigo': 'DIN' })

    if (pantallas.length === 0) {



        await new Pantalla({ 'nombre': 'Datos de jugador', 'menu': 'Jugador', 'opcionMenu': 'Datos de jugador', 'componente': 'ModificacionDatos', 'roles': [delegadoInst._id, jugador._id] }).save()
        await new Pantalla({ 'nombre': 'Datos deportivos', 'menu': 'Jugador', 'opcionMenu': 'Datos deportivos', 'componente': 'DatosDeportivosListaPage', 'roles': [delegadoInst._id, jugador._id,] }).save()
        await new Pantalla({ 'nombre': 'Cambiar Password', 'menu': 'Jugador', 'opcionMenu': 'Cambiar Passowrd', 'componente': 'ModificarPasswordPage', 'roles': [jugador._id, delegadoInst._id, delegado._id,] }).save()


        await new Pantalla({ 'nombre': 'Eventos', 'menu': 'Agenda', 'opcionMenu': 'Eventos', 'componente': 'ListaEventosPage', 'roles': [delegadoInst._id, jugador._id, delegado._id, dt._id,] }).save()
        await new Pantalla({ 'nombre': 'Fixture', 'menu': 'Agenda', 'opcionMenu': 'Fixture', 'componente': 'MantenimientoCampeonatosPage', 'roles': [delegadoInst._id, delegado._id, jugador._id, dt._id] }).save()


        await new Pantalla({ 'nombre': 'Registro de Pago', 'menu': 'Tesorería', 'opcionMenu': 'Registro de Pago', 'componente': 'RegistroPagoCuotaPage', 'roles': [jugador._id,delegadoInst._id, tesorero._id,] }).save()
        await new Pantalla({ 'nombre': 'Conceptos de Caja', 'menu': 'Tesorería', 'opcionMenu': 'Conceptos de Caja', 'componente': 'ConceptosDeCajaPage', 'roles': [delegadoInst._id, tesorero._id,] }).save()
        await new Pantalla({ 'nombre': 'Pagos Pendientes', 'menu': 'Tesorería', 'opcionMenu': 'Pagos Pendientes', 'componente': 'PagosPendientesPage', 'roles': [delegadoInst._id, tesorero._id,] }).save()
        await new Pantalla({ 'nombre': 'Ingreso Movimiento', 'menu': 'Tesorería', 'opcionMenu': 'Ingreso Movimiento', 'componente': 'RegistroMovCajaPage', 'roles': [delegadoInst._id, tesorero._id,] }).save()
        await new Pantalla({ 'nombre': 'Cons. Movimientos', 'menu': 'Tesorería', 'opcionMenu': 'Cons. Movimientos', 'componente': 'SaldoMovimientosCategoriaPage', 'roles': [delegadoInst._id, delegado._id, tesorero._id, jugador._id] }).save()
        await new Pantalla({ 'nombre': 'Cons. Mov y Sdo por Jugador', 'menu': 'Tesorería', 'opcionMenu': 'Cons. Mov y Sdo por Jugador', 'componente': 'SaldosJugadoresPage', 'roles': [delegadoInst._id, delegado._id, jugador._id, tesorero._id,] }).save()
        await new Pantalla({ 'nombre': 'Cons. Saldo plantel', 'menu': 'Tesorería', 'opcionMenu': 'Cons. Saldo Plantel', 'componente': 'SaldosPlantelPage', 'roles': [delegadoInst._id, delegado._id, jugador._id, tesorero._id,] }).save()


        await new Pantalla({ 'nombre': 'Registro de datos', 'menu': 'Dirección Técnica', 'opcionMenu': 'Registro de datos', 'componente': 'ListaEventosPage', 'roles': [delegadoInst._id, dt._id,] }).save()
        await new Pantalla({ 'nombre': 'Datos de usuario', 'menu': 'Dirección Técnica', 'opcionMenu': 'Datos de usuario', 'componente': 'ModificacionDatos', 'roles': [delegadoInst._id, dt._id] }).save()
        await new Pantalla({ 'nombre': 'Cambiar Password', 'menu': 'Dirección Técnica', 'opcionMenu': 'Cambiar Passowrd', 'componente': 'ModificarPasswordPage', 'roles': [dt._id] }).save()
        await new Pantalla({ 'nombre': 'Plantel', 'menu': 'Dirección Técnica', 'opcionMenu': 'Plantel', 'componente': 'PlantelPage', 'roles': [delegadoInst._id,dt._id] }).save()



        await new Pantalla({ 'nombre': 'Categorías', 'menu': 'Delegado', 'opcionMenu': 'Categorías', 'componente': 'ListaCategoriasPage', 'roles': [delegadoInst._id,] }).save()
        await new Pantalla({ 'nombre': 'Plantel', 'menu': 'Delegado', 'opcionMenu': 'Plantel', 'componente': 'PlantelPage', 'roles': [delegadoInst._id, delegado._id,] }).save()
        await new Pantalla({ 'nombre': 'Creación de Usuario', 'menu': 'Delegado', 'opcionMenu': 'Creación de Usuario', 'componente': 'AltaDeUsuarioPage', 'roles': [delegadoInst._id, delegado._id,] }).save()
        await new Pantalla({ 'nombre': 'Datos Usuarios', 'menu': 'Delegado', 'opcionMenu': 'Datos Usuarios', 'componente': 'ConsultaModificacionDatosPage', 'roles': [delegadoInst._id, delegado._id,] }).save()
        await new Pantalla({ 'nombre': 'Mod perfiles y password', 'menu': 'Delegado', 'opcionMenu': 'Mod perfiles y password', 'componente': 'UsuariosEnCategoríaPage', 'roles': [delegadoInst._id, delegado._id,] }).save()
        await new Pantalla({ 'nombre': 'Campeonatos', 'menu': 'Delegado', 'opcionMenu': 'Campeonatos', 'componente': 'ListaCampeonatosPage', 'roles': [delegadoInst._id, delegado._id,] }).save()
        await new Pantalla({ 'nombre': 'Tipo de Eventos', 'menu': 'Delegado', 'opcionMenu': 'Tipo de Eventos', 'componente': 'TipoEventosPage', 'roles': [delegadoInst._id, delegado._id,] }).save()





    }

}

const cargaDelegadosI = async () => {
    const usuarios = await Usuario.find()
    if (usuarios.length === 0) {
        let correos = ['gab.arpe@gmail.com','natir0501@gmail.com','tomato23@gmail.com']

        for (let i = 0; i < correos.length; i++) {
            let usuario = new Usuario({ 'email': correos[i], 'delegadoInstitucional': true })
            await usuario.generateAuthToken()
            usuario = await usuario.save()
            await usuario.enviarConfirmacionAlta()
        }

    }




}


const batch = async () => {
    try {
         // minute hour dom month dow
        cron.schedule('50 21 * * *', cuotasBatch, {
                scheduled: true,
                timezone: "America/Montevideo"
            });

    } catch (e) {
        console.log(e)
        console.log('Ocurrión un error en el proceso batch, comunique al analista')
    }
}

const cuotasBatch = async () => {
            
    const concepto = await ConceptosCaja.findOne({ nombre: 'Cobro de couta' })
    let usuarios
   
    console.log( `### ${new Date()} CORRIENDO BATCH DE CUOTAS###`);
    let categorias = await Categoria.find({ diaVtoCuota: new Date().getDate() })
    console.log(`Cantidad de categorías a cobrar: ${categorias.length}`)
    for (let cat of categorias) {
        console.log(`Se cobra cuota de categoría ${cat.nombre}`)
        usuarios = await Usuario.find({ categoriacuota: cat._id, activo: true })
        usuarios = usuarios.filter((u)=>{return cat.jugadores.indexOf(u._id) >= 0})
        console.log(`Se cobran cuotas de ${usuarios.length} jugadores.`)
        for (let usu of usuarios) {
            let mesActual = new Date().getMonth() + 1
            let cuenta = await Cuenta.findOne({ _id: usu.cuenta })
            if (usu.ultimoMesCobrado < mesActual && mesActual < 13) {
                let cantidadCuotas = mesActual - usu.ultimoMesCobrado
                console.log(cuenta.movimientos.length, 'Antes mov')
                for (let i = 0; i < cantidadCuotas; i++) {
                    cuota = +usu.ultimoMesCobrado + 1 + i
                    cuenta.movimientos.push(new Movimiento({
                        fecha: Date.now(),
                        monto: cat.valorCuota,
                        tipo: concepto.tipo,
                        concepto,
                        estado: 'Confirmado',
                        comentario: `Cobro cuota mes ${cuota}`

                    }))
                    console.log('Antes', cuenta.saldo)
                    cuenta.saldo = cuenta.saldo - cat.valorCuota
                    console.log('Despues',cuenta.saldo)
                    cuenta = await cuenta.save()
                    console.log(cuenta.movimientos.length, 'Despues mov')

                    
                    title = 'Aviso de cobro de couta'
                    body = `Hola! Se ha imputado en tu saldo la cuota del mes ${cuota}.`
                    if (usu.hasMobileToken()){
                        enviarNotificacion(usu, title, body)
                    }else{
                        enviarCorreoNotificacion(usu,title,body)
                        if(usu.tokens.length > 1){
                            enviarNotificacion(usu, tituloNot, bodyNot)
                        }
                    }
                }
               
                usu.ultimoMesCobrado = mesActual
                await usu.save()
            }
        }

    }
    console.log( `### ${new Date()} FIN BATCH DE CUOTAS###`);

}


module.exports = { scriptInicial }
