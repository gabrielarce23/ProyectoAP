import { Component } from '@angular/core';
import { LoadingController, NavController, NavParams } from 'ionic-angular';
import { Categoria } from '../../../models/categoria.models';
import { Usuario } from '../../../models/usuario.model';
import { UtilsServiceProvider } from '../../../providers/utils.service';
import { MantenimientoFechaPage } from '../../Backoffice/mantenimiento-fecha/mantenimiento-fecha';
import { DetalleFechaPage } from '../../detalle-fecha/detalle-fecha';
import { ListaCampeonatosPage } from '../lista-campeonatos/lista-campeonatos';
import { Campeonato, Fecha } from './../../../models/campeonato.model';
import { CampeonatoService } from './../../../providers/campeonato.service';
import { CategoriaService } from './../../../providers/categoria.service';
import { UsuarioService } from './../../../providers/usuario.service';


@Component({
  selector: 'page-mantenimiento-campeonatos',
  templateUrl: 'mantenimiento-campeonatos.html',
})
export class MantenimientoCampeonatosPage {

  campeonato: Campeonato = new Campeonato();
  fecha: Fecha = new Fecha;
  fechas: Fecha[] = [];
  categoria: Categoria = new Categoria()

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public campServ: CampeonatoService,
    public utilServ: UtilsServiceProvider,
    private loadingCtrl: LoadingController,
    public usuServ: UsuarioService,
    public catService: CategoriaService) {
  }

  async ionViewDidLoad() {

    let loading = this.loadingCtrl.create({
      content: 'Cargando',
      spinner: 'circles'
    });
    loading.present()
    try {
      let camp: Campeonato = this.navParams.get('campeonato')
      this.categoria._id = this.usuServ.usuario.perfiles[0].categoria

      let dataUsuarios: any = await this.catService.obtenerCategoria(this.categoria._id).toPromise()
      if (dataUsuarios) {
        this.categoria = dataUsuarios.data.categoria
      }
      if (camp) {
        this.campeonato = camp
        this.fechas = camp.fechas
      } else {
        if (this.categoria.campeonatos.length > 0) {
          let datosCamp: any = await this.campServ.consultarCampeonatoActual(this.categoria).toPromise();

          if (datosCamp) {
            this.campeonato = datosCamp.data.campeonato
            this.fechas = this.campeonato.fechas
          }

        }else{
          this.utilServ.dispararAlert('Upsss!','No se encontraron campeonatos para la categoría acutal')
        }
      }
      loading.dismiss()
    } catch (e) {
      console.log(e)
      loading.dismiss()
      this.utilServ.dispararAlert('Error', 'Ocurrió un error al cargar la información')
    }

  }

  async onSubmit() {
    let loading = this.loadingCtrl.create({
      content: 'Cargando',
      spinner: 'circles'
    });
    loading.present()
    if (this.campeonato._id === '') {

      this.categoria._id = this.usuServ.usuario.perfiles[0].categoria
      let dataUsuarios: any = await this.catService.obtenerCategoria(this.categoria._id).toPromise()
      if (dataUsuarios) {
        this.categoria = dataUsuarios.data.categoria
      }
      this.campeonato.categoria = {_id: this.categoria._id}
      this.campServ.agregarCampeonato(this.campeonato)
        .subscribe(
          (resp) => {
            loading.dismiss()
            this.utilServ.dispararAlert("Ok", "Campeonato agregado correctamente.")
            this.navCtrl.setRoot(ListaCampeonatosPage)
          },
          (err) => {
            loading.dismiss()
            console.log("Error dando de alta el campeonato", err)
            this.utilServ.dispararAlert("Error", "Ocurrió un error al agregar el campeonato")
          }
        )

    } else {

      this.campServ.actualizarCampeonato(this.campeonato)
        .subscribe(
          (resp) => {
            loading.dismiss()
            this.utilServ.dispararAlert("Ok", "Campeonato modificado correctamente.")
            this.navCtrl.setRoot(ListaCampeonatosPage)
          },
          (err) => {
            loading.dismiss()
            console.log("Error al modificar el campeonato", err)
            this.utilServ.dispararAlert("Error", "Ocurrió un error al modificar el campeonato")
          }
        )

    }

  }

  editarFecha(fech: Fecha) {
    let fecha = fech
    let camp = this.campeonato
    this.navCtrl.push((MantenimientoFechaPage), { fecha, camp })
    console.log("Editar fecha");

  }

  consultarFecha(fech: Fecha) {
    let fecha = fech
    this.navCtrl.push((DetalleFechaPage), { fecha })


  }


  agregarFecha() {
    let camp = this.campeonato;
    this.navCtrl.push((MantenimientoFechaPage), { camp })

  }

  puedeEditar(): boolean {
    let usuario: Usuario = this.usuServ.usuario
    if (usuario) {
      if (usuario.delegadoInstitucional) return true
      for (let usu of this.categoria.delegados) {
        if (usu._id === usuario._id) {
          return true
        }
      }
    }
  }

  hayCampeonato(): boolean {
    let hayCamp = this.campeonato._id != ""
    return hayCamp;
  }


}
