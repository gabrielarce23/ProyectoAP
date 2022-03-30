import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular';

/**
 * Generated class for the ModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-modal',
  templateUrl: 'modal.html',
})
export class ModalPage {

  imagenQR: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public ViewCtrl: ViewController) {
    this.imagenQR = navParams.get('imagenQR');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalPage');
  }

  cerrarModal() {
    this.ViewCtrl.dismiss();
  }



}
