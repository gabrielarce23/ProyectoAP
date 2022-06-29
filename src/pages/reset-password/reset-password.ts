import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../providers/usuario.service';
import { UtilsServiceProvider } from '../../providers/utils.service';


@IonicPage({
  segment: 'resetPassword/:token'
})
@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPasswordPage implements OnInit {

  formulario: FormGroup
  nuevaPassword: string = ''
  repetirPassword: string = ''
  usuario: Usuario = new Usuario()

  constructor(public navCtrl: NavController, public navParams: NavParams, private usuServ: UsuarioService, private alertCtrl: AlertController
    , private loadContr: LoadingController, private util: UtilsServiceProvider) {
    this.formulario = this.createFormGroup()
  }

  ngOnInit() {

  }

  createFormGroup() {
    return new FormGroup({

      newpassword: new FormControl(null, [Validators.required, Validators.pattern('(?=.*?[a-z])(?=.*?[0-9]).{8,}')]),
      repeatpassword: new FormControl(null, [Validators.required, this.validarPassword.bind(this.formulario)],),



    });
  }

  ionViewCanEnter() {


    let token = this.navParams.get('token')

    this.usuServ.token = token
    this.usuServ.getUserByToken().subscribe((resp) => {
      this.usuServ.usuario = resp.data.usuario
      this.usuario = resp.data.usuario

      this.usuario.perfiles = resp.data.usuario.perfiles
      this.usuServ.usuario = resp.data.usuario


    }, (err) => {
      console.log(err)
      let alert = this.alertCtrl.create({
        title: 'Error',
        message: 'Link ha expirado',
        buttons: [
          {
            text: 'Aceptar',
            handler: () => {
              window.location.href = window.location.origin
              this.navCtrl.goToRoot({})
            }

          }

        ]
      });
      alert.present();
    }


    )


  }

  onSubmit() {
    let loader = this.loadContr.create({
      content: 'Cargando',
      spinner: 'circles'
    });
    loader.present()

    this.usuServ.modificarPassword({ usuario: this.usuario, nuevaPassword: this.formulario.value.newpassword })
      .subscribe((resp) => {
        loader.dismiss()

        let alert = this.alertCtrl.create({
          title: 'Éxito',
          message: 'Usuario modificado correctamente',
          buttons: [
            {
              text: 'Aceptar',
              handler: () => {
                window.location.href = window.location.origin
                this.navCtrl.goToRoot({})
              }

            }

          ]
        });
        alert.present();
      }, (err) => {
        console.log(err)
        loader.dismiss()
        let alert = this.alertCtrl.create({
          title: 'Error',
          message: 'Ocurrió un error al procesar solicitud',
          buttons: [
            {
              text: 'Aceptar',
            }

          ]
        });
        alert.present();

      })
  }

  validarPassword(arg: FormControl): { [s: string]: boolean } {
    if (arg.root.value && arg.root.value.newpassword !== arg.value) {

      return { 'nameIsForbidden': true }
    }

    return null
  }

  mostrarUsuario(usuario: Usuario) {
    let etiqueta: String = ''
    etiqueta = usuario.nombre ? etiqueta + ' ' + usuario.nombre : etiqueta
    etiqueta = usuario.apellido ? etiqueta + ' ' + usuario.apellido : etiqueta
    etiqueta = etiqueta === '' ? ` (${usuario.email})` : etiqueta
    return etiqueta
  }
}
