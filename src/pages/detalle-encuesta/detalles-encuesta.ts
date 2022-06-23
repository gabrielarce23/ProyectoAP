import { Component } from '@angular/core';
import { LoadingController, ModalController, NavController, NavParams } from 'ionic-angular';
import { Encuesta } from '../../models/encuesta.models';
import { Usuario } from '../../models/usuario.model';
import { CategoriaService } from '../../providers/categoria.service';
import { EncuestaService } from '../../providers/encuesta.service';
import { EventoService } from '../../providers/evento.service';
import { UsuarioService } from '../../providers/usuario.service';
import { UtilsServiceProvider } from '../../providers/utils.service';
import { HomePage } from '../home/home';


/**
 * Generated class for the DetallesEventoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-detalles-encuesta',
  templateUrl: 'detalles-encuesta.html',
})
export class DetallesEncuestaPage {

  encuesta: Encuesta = new Encuesta()
  usuario: Usuario = new Usuario()
  voto: string = '';
  opcionesLinkeables: any[] = []
  modo: string = '';
  resultados: { totalVotos: number, mapaResultados: any, ganador: string } = { totalVotos: 0, mapaResultados: {}, ganador: '' };


  constructor(public navCtrl: NavController, public navParams: NavParams,
    private loader: LoadingController, private usuServ: UsuarioService,

    private utilServ: UtilsServiceProvider, private encuestaServ: EncuestaService, public modalCtrl: ModalController) {
    this.encuesta = this.navParams.get('encuesta')
    this.modo = this.navParams.get('modo');
    this.opcionesLinkeables = this.encuesta.opciones.filter(o => !!o.link)
    this.voto = this.encuesta.voto ? this.encuesta.voto.opcion : undefined
  }

  async ionViewWillEnter() {
    let loader = this.loader.create({
      content: 'Cargando...',
      spinner: 'circles'

    })
    loader.present()
    this.usuario = this.usuServ.usuario
    try {

      if (this.modo === 'resultados') {
        await this.obtenerResultados()
      }

      loader.dismiss()

    } catch (e) {
      loader.dismiss()
      console.log(e)
    }
  }


  votar() {
    if (!this.voto) {
      return
    }
    let loader = this.loader.create({
      content: 'Cargando...',
      spinner: 'circles'

    })
    loader.present()

    this.encuestaServ.votar(this.encuesta._id, this.voto).subscribe((resp) => {
      loader.dismiss()
      this.utilServ.dispararAlert("Ok", "El voto se ha procesado correctamente")
      this.navCtrl.setRoot(HomePage)
    }, (err) => {
      loader.dismiss()
      console.log(err)
      this.utilServ.dispararAlert('Error', "No se ha podido completar la solicitud")
    })

  }

  abrirLink(link: string) {
    window.open('https://sites.google.com/view/cei-app/', '_system')
  }


  goBack() {
    this.navCtrl.setRoot(HomePage)
  }

  async obtenerResultados() {
    let resp: any = await this.encuestaServ.getVotos(this.encuesta._id).toPromise()
    if (resp) {
      this.procesarVotos(resp.data.votos)
    }
  }

  procesarVotos(votos: string[]) {
    const sumVotosMap = this.encuesta.opciones.reduce((acumulado, actual) => {
      return { ...acumulado, [actual._id]: 0 }
    }, {})
    votos.forEach(v => {
      sumVotosMap[v]++
    })

    this.resultados = {
      totalVotos: votos.length,
      mapaResultados: sumVotosMap,
      ganador: ''
    }

    let ganador = '';
    let maximoVotos = 0;

    for (let opcion in this.resultados.mapaResultados) {
      if (this.resultados.mapaResultados[opcion] > maximoVotos) {
        maximoVotos = this.resultados.mapaResultados[opcion]
        ganador = opcion
      }
    }

    this.resultados.ganador = ganador
  }

  labelResultado(opcion: any) {
    const votos = this.resultados.mapaResultados[opcion._id]
    const porcentaje = votos > 0 ? ((votos / this.resultados.totalVotos) * 100).toFixed(1) : 0
    return `${opcion.nombre} --->  ${porcentaje}% (${votos} ${votos === 1 ? 'voto' : 'votos'})`
  }

  async refrescarResultados() {
    let loader = this.loader.create({
      content: 'Cargando...',
      spinner: 'circles'

    })
    loader.present()
    try {
      await this.obtenerResultados()
      loader.dismiss()
    } catch (e) {
      loader.dismiss()
      console.log(e)
    }
  }

  getLabelFooter() {
    
    if(this.modo === 'voto') {
      if(this.encuesta.voto) {
        return `Opción elegida anteriormente: ${this.encuesta.opciones.find(o => o._id === this.encuesta.voto.opcion).nombre}`
      } else {
        return ''
      }
    } else {
      const porcentaje = (this.resultados.totalVotos/this.encuesta.habilitados.length) * 100
      return `Votos: ${this.resultados.totalVotos} de ${this.encuesta.habilitados.length} habilitados (${porcentaje.toFixed(1)} %)`
    }
  }



}
