import { LoginPage } from './../login/login';
import { Posiciones } from './../../../models/enum.models';
import { UsuarioService } from './../../../providers/usuario.service';
import { Usuario } from './../../../models/usuario.model';
import { Component, ViewChild, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { NgForm, NgControl, FormControl } from '@angular/forms';
import { UtilsServiceProvider } from '../../../providers/utils.service';
import { HttpClient } from '@angular/common/http';

/**
 * Generated class for the RegistroPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({

  segment: 'registro/:token'
})
@Component({
  selector: 'page-registro',
  templateUrl: 'registro.html',

})
export class RegistroPage implements OnInit {

  @ViewChild('form') form: NgForm

  usuario: Usuario = new Usuario()
  fmedicaVigente: boolean = false
  fechaVtoTxt: string = '2020-01-01'
  fechaNacTxt: string = '1990-01-01'

  posiciones = Object.keys(Posiciones).map(key => ({ 'id': key, 'value': Posiciones[key] }))
  posicionesElegidas: string[] = ['GK'];


  constructor(public navCtrl: NavController, public navParams: NavParams,
    private usuarioServ: UsuarioService,
    private http: HttpClient,
    private toast: ToastController,
    private util: UtilsServiceProvider) {

  }

  ngOnInit() {

  }
  ionViewCanEnter() {

      
      let token = this.navParams.get('token')
      
      this.usuarioServ.token = token
      
      this.usuarioServ.getUserByToken().subscribe((resp) => {
        this.usuarioServ.usuario = resp.data.usuario
        if (resp.data.usuario.activo) {
          this.util.dispararAlert('Registro completo', 'Ya has completado el registro')
          window.location.href = window.location.origin
        }
        this.usuario._id = resp.data.usuario._id
        
        this.usuario.perfiles = resp.data.usuario.perfiles
        this.usuarioServ.usuario = resp.data.usuario
        


      }, (err) => {
       
        window.location.href = window.location.origin
        this.navCtrl.goToRoot({})
      }


      )
    

  }


  onSubmit() {
    if (this.validoUsuario()) {
      this.usuario.activo = true;
  
      this.usuarioServ.actualizarUsuario(this.usuario).subscribe((resp) => {
        this.util.dispararAlert('Éxito', "Registro realizado correctamente")
        window.location.href = window.location.origin
        
      }, (err) => {
        this.util.dispararAlert('Error', "Error al dar de alta, intente nuevamente")
        console.log(err)
      })
    }

  }

  validoUsuario(): boolean {


    this.usuario.fechaNacimiento = Date.parse(this.fechaNacTxt) + 86400000
    if (this.usuario.fechaNacimiento >= Date.now()) {
      this.util.dispararAlert('Fecha de Nacimiento', "Fecha de nacimiento inválida")
      return false
    }
    if(!this.fmedicaVigente){
      this.usuario.fechaVtoCarneSalud = new Date('2018-01-02').valueOf()
      return true
    }  
    if (this.fmedicaVigente && Date.parse(this.fechaVtoTxt) <= Date.now()) {
      this.util.dispararAlert('F/Médica - C/ Salud', "Fecha de vencimiento inválida")
      return false
    }
    this.usuario.fechaVtoCarneSalud = Date.parse(this.fechaVtoTxt) + 86400000
    return true
  }


}
