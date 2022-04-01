import { UtilsServiceProvider } from './../../providers/utils.service';
import { EventoService } from './../../providers/evento.service';
import { UsuarioService } from './../../providers/usuario.service';
import { ListaEventosPage } from './../lista-eventos/lista-eventos';
import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ModalController } from 'ionic-angular';
import { Evento } from '../../models/evento.models';
import { Usuario } from '../../models/usuario.model';


/**
 * Generated class for the DetallesEventoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-detalles-evento',
  templateUrl: 'detalles-evento.html',
})
export class DetallesEventoPage {

  evento: Evento = new Evento()
  btnConvocados: string = '+'
  btnVan: string = '+'
  btnNoVan: string = '+'
  btnDuda: string = '+'
  verConvocados: boolean = false
  verVan: boolean = false
  verNoVan: boolean = false
  verDuda: boolean = false
  usuario: Usuario = new Usuario()


  constructor(public navCtrl: NavController, public navParams: NavParams,
    private loader: LoadingController, private usuServ: UsuarioService,
    private utilServ: UtilsServiceProvider, private eventServ: EventoService, public modalCtrl: ModalController) {
    this.evento = this.navParams.get('evento')
  }

  async ionViewWillEnter() {

    this.usuario = this.usuServ.usuario
    try {

      let resp: any = await this.eventServ.getEvento(this.evento._id).toPromise()
      if (resp) {
        this.evento = resp.data.evento
      }
    } catch (e) {
      console.log(e)
    }
  }


  abrirModal(evento: Evento) {
    this.utilServ.abrirImagen(evento.imagenQR)
  }

  goBack() {
    this.navCtrl.setRoot(ListaEventosPage)
  }
  descUsu(usu: Usuario) {
    if (usu.nombre) {
      return usu.nombre + ' ' + usu.apellido
    }
    return usu.email
  }
  toggle(lista: string) {

    if (lista === 'convocados') {

      if (!this.verConvocados) {

        this.btnConvocados = '-'

      } else {
        this.btnConvocados = '+'
      }
      this.verConvocados = !this.verConvocados
    }
    if (lista === 'van') {
      if (!this.verVan) {
        this.btnVan = '-'
      } else {
        this.btnVan = '+'
      }
      this.verVan = !this.verVan
    }
    if (lista === 'duda') {
      if (!this.verDuda) {
        this.btnDuda = '-'
      } else {
        this.btnDuda = '+'
      }
      this.verDuda = !this.verDuda
    }
    if (lista === 'noVan') {
      if (!this.verNoVan) {
        this.btnNoVan = '-'
      } else {
        this.btnNoVan = '+'
      }
      this.verNoVan = !this.verNoVan
    }
  }

  diayhora(): string {
    return new Date(this.evento.fecha).toLocaleString()
  }

  puedoIr() {
    if (this.evento.confirmados.find((u) => u._id === this.usuario._id)) return false

    return true
  }

  puedoNoIr() {
    if (this.evento.noAsisten.find((u) => u._id === this.usuario._id)) return false

    return true
  }

  puedoDudar() {
    if (this.evento.duda.find((u) => u._id === this.usuario._id)) return false

    return true
  }

  convocado() {
    if (this.evento.fecha < Date.now()) return false
    if (this.evento.invitados.find((u) => u._id === this.usuario._id)) return true
    if (this.evento.duda.find((u) => u._id === this.usuario._id)) return true
    if (this.evento.confirmados.find((u) => u._id === this.usuario._id)) return true
    if (this.evento.noAsisten.find((u) => u._id === this.usuario._id)) return true
    return false
  }

  confirmar(asiste: boolean | undefined) {
    let loader = this.loader.create({
      content: 'Cargando...',
      spinner: 'circles'

    })
    loader.present()
    this.eventServ.confirmar(this.usuario, asiste, this.evento._id).subscribe((resp) => {
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
      this.navCtrl.setRoot(ListaEventosPage)
    }, (err) => {
      console.log(err)
      this.utilServ.dispararAlert('Error', "No se ha podido completar la solicitud")
    })
  }
  generoPDF() {

    //Un array de columnas
    let columnas = ['Nombre', 'Tipo Evento', 'Fecha', 'Lugar', 'Convocados', 'Van', 'No Van']

    //ESTO ES UN ARRAY DE FILAS
    let contenidoFilas = []

    //CADA FILA ES UNA ARRAY QUE LE VOY TIRANDO LOS DATOS
    let fila = [this.evento.nombre, this.evento.tipoEvento.nombre, new Date(this.evento.fecha).toLocaleDateString(), this.evento.lugar.nombre, this.evento.invitados.length
      , this.evento.confirmados.length, this.evento.noAsisten.length]

    //AGREGO LA FILA AL ARRAY DE FILAS
    contenidoFilas.push(fila)

    //LLAMO AL METODO PARA GENAR EL PDF, PASO COLUMNAS, FILAS, NOMBRE DE ARCHIVO
    //Y SI LO QUIERO APAISADO LE PASO UN 'h' sino el cuarto parámetro no va
    this.utilServ.generarPDF(columnas, contenidoFilas, `Evento ${this.evento.nombre}`, 'h')

  }
}
