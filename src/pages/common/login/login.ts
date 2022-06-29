import { HomePage } from './../../home/home';
import { UsuarioService } from './../../../providers/usuario.service';
import { Usuario } from './../../../models/usuario.model';
import { Component, ViewChild } from '@angular/core';
import {  NavController, NavParams } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { UtilsServiceProvider } from '../../../providers/utils.service';


/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */





@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  @ViewChild('loginForm') loginForm: NgForm
  usuario: Usuario = new Usuario()


  constructor(public navCtrl: NavController, public utils: UtilsServiceProvider, public navParams: NavParams, private usuarioServ: UsuarioService) {
  }




 onSubmit() {

    
    this.usuarioServ.login(this.usuario).then((resp: Usuario) => {
      if (resp) {
        this.utils.dispararAlert('Login Correcto', `Bienvenido/a ${resp.nombre}!`)
        this.navCtrl.setRoot(HomePage)
      } else {
        this.utils.dispararAlert('Login Incorrecto', 'Por favor verifica tu usuario y password')
      }

    }).catch((err) => {
      console.log(err)

    })


  }
  clickRecupero() {

    this.usuarioServ.recuperoPassword(this.loginForm.value.usuario).toPromise().then((resp: Usuario) => {
      if (resp) {
        this.utils.dispararAlert('Correo enviado', `Revisa tu casilla para recuperar tu password.`)
      } else {
        this.utils.dispararAlert('Error', 'No existe usuario con ese correo')
      }

    }).catch((err) => {
      console.log(err)
      this.utils.dispararAlert('Error', 'No existe usuario con ese correo')

    })
    
  }

}

