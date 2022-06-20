import { Component } from '@angular/core';
import { AlertController, LoadingController, NavController, Platform, ModalController } from 'ionic-angular';
import { Evento } from '../../models/evento.models';
import { EventoService } from '../../providers/evento.service';
import { DetallesEventoPage } from '../detalles-evento/detalles-evento';
import { Categoria, Cuenta } from './../../models/categoria.models';
import { Usuario } from './../../models/usuario.model';
import { CategoriaService } from './../../providers/categoria.service';
import { FirebaseMessagingProvider } from './../../providers/firebase-messaging';
import { UsuarioService } from './../../providers/usuario.service';
//import { AltaDeUsuarioPage } from '../Backoffice/alta-usuario';
import { UtilsServiceProvider } from './../../providers/utils.service';
import { QRIMAGE } from '../../providers/constant';
import { Encuesta } from '../../models/encuesta.models';
import { EncuestaService } from '../../providers/encuesta.service';
import { DetallesEncuestaPage } from '../detalle-encuesta/detalles-encuesta';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  usuario: Usuario = new Usuario()
  eventos: Evento[] = []
  encuestas: Encuesta[] = []
  categoria: Categoria = new Categoria()
  habilitoHome: boolean = false;
  cuenta: Cuenta = new Cuenta()
  mostrarSaldo: boolean = false
  qrImage: string = QRIMAGE;

  constructor(public navCtrl: NavController, private alertCtrk: AlertController,
    private platform: Platform, public fmp: FirebaseMessagingProvider
    , private loader: LoadingController, private utilServ: UtilsServiceProvider,
    private userServ: UsuarioService, public util: UtilsServiceProvider, private catServ: CategoriaService
    , private eventServ: EventoService, private encuestaServ: EncuestaService, public modalCtrl: ModalController) {
  }
  async ionViewWillEnter() {
     try {
 
       if (this.userServ.usuario && this.userServ.usuario.perfiles.length === 1) {
         this.usuario = this.userServ.usuario
         let resp: any = await this.catServ.obtenerCategoria(this.usuario.perfiles[0].categoria).toPromise()
         if (resp) {
 
           this.categoria = resp.data.categoria
           this.obtenerEventos()
           this.obtenerEncuestas()
           let resp2 = await this.userServ.getCuenta(this.usuario._id).toPromise()
           if (resp2) {
             this.cuenta = resp2.data.cuenta
             this.habilitoHome = true;
             this.mostrarSaldo = this.usuario.categoriacuota.toString() === this.usuario.perfiles[0].categoria
           }
         }
       }
     } catch (e) {
       console.log(e)
     }
 


  }

  abrirModal(evento: Evento) {
    /* let modal = this.modalCtrl.create(ModalPage, { imagenQR: evento.imagenQR });
    modal.present(); */

    this.utilServ.abrirImagen(evento.imagenQR + '')
  }

  getSubtitulo(evento: Evento) {
    let date = new Date(evento.fecha)

    let dia = ('00' + date.getDate()).slice(-2)
    let mes = ('00' + (date.getMonth() + 1)).slice(-2)
    let anio = date.getFullYear()
    let hora = date.getHours() >= 10 ? date.getHours() : '0' + date.getHours()
    let minutos = date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes()

    return `${dia}/${mes}/${anio} - ${hora}:${minutos} hs. - ${evento.tipoEvento.nombre}`
  }

  get fechaCuota() {
    let ahora = new Date()
    let dia = ahora.getDate()
    if (
      (ahora.getMonth() > 10 && dia > this.categoria.diaVtoCuota) ||
      (ahora.getMonth() + 1 <= 12 - this.categoria.cantidadCuotasAnuales)
    ) {
      return ''
    }
    let mes = dia > this.categoria.diaVtoCuota ? ahora.getMonth() + 2 : ahora.getMonth() + 1
    return `${('00' + this.categoria.diaVtoCuota).slice(-2)}/${('00' + mes).slice(-2)}/${ahora.getFullYear()}`
  }

  async obtenerEventos() {
    try {


      let resp = await this.eventServ.obtenerEventosHome(this.usuario._id, this.categoria._id).toPromise()
      if (resp) {
        this.eventos = resp.data.eventos

      }

    } catch (e) {
      console.log(e)
    }
  }
  async obtenerEncuestas() {
    try {


      let resp = await this.encuestaServ.obtenerEncuestas().toPromise()
      if (resp) {
        this.encuestas = resp.data.encuestas

      }

    } catch (e) {
      console.log(e)
    }
  }
  confirmar(asiste: boolean | undefined, evento: Evento) {
    try {

      let loader = this.loader.create({
        content: 'Cargando...',
        spinner: 'circles'

      })
      loader.present()
      this.eventServ.confirmar(this.usuario, asiste, evento._id).subscribe((resp) => {
        loader.dismiss()
        if (asiste === undefined) {
          this.utilServ.dispararAlert("Procesado", "Ha puesto en duda que asiste al evento")
        } else {

          if (asiste) {
            this.utilServ.dispararAlert("Procesado", "Ha confirmado que asiste al evento")
          } else {
            this.utilServ.dispararAlert("Procesado", "Ha confirmado que no asiste al evento")
          }
        }
        this.obtenerEventos()

      }, (err) => {
        loader.dismiss()
        console.log(err)
        this.utilServ.dispararAlert('Error', "No se ha podido completar la solicitud")
      })
    } catch (e) {
      console.log(e)
    }
  }


  detalles(evento: Evento) {
    this.navCtrl.push(DetallesEventoPage, { evento })
  }

  esVeedor(encuesta: Encuesta) {
    return !!encuesta.veedores.find(v => v === this.usuario._id)
  }
  estaHabilitado(encuesta: Encuesta) {
    return !!encuesta.habilitados.find(v => v === this.usuario._id)
  }

  irAVotar(encuesta: Encuesta) {
    this.navCtrl.push(DetallesEncuestaPage, { encuesta, modo: 'voto' })
  }

  verResultados(encuesta: Encuesta) {
    this.navCtrl.push(DetallesEncuestaPage, { encuesta, modo: 'resultados' })
  }




}
