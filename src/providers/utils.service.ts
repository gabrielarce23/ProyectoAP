import { Injectable } from "@angular/core";
import { AlertController } from 'ionic-angular';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';

@Injectable()
export class UtilsServiceProvider {

  apiUrl: string = ''

  constructor(private alertCtrl: AlertController) { }

  dispararAlert(title: string, text: string, callback?: any) {
    let alert = this.alertCtrl.create({
      title: title,
      message: text,
      buttons: [
        {
          text: 'Aceptar',
          // handler: callback()

        }

      ]
    });
    alert.present();
  }

  abrirImagen(imagenQR: String) {
    let alert = this.alertCtrl.create({
      message: `<img src="${imagenQR}" class="qr-modal-img" alt="Imagen QR" />`,
      cssClass: 'modal-qr'
    });
    alert.present();
  }

  fechahoraToText(tiempo: Date): string {
    let year = tiempo.getFullYear()
    let mes = tiempo.getMonth() + 1 < 10 ? '0' + (tiempo.getMonth() + 1) : (tiempo.getMonth() + 1)
    let dia = tiempo.getDate() < 10 ? '0' + tiempo.getDate() : tiempo.getDate()
    let hora = tiempo.getHours() < 10 ? '0' + tiempo.getHours() : tiempo.getHours()
    let minutos = tiempo.getMinutes() < 10 ? '0' + tiempo.getMinutes() : tiempo.getMinutes()

    return `${year}-${mes}-${dia}T${hora}:${minutos}`
  }
  fechaToText(tiempo: Date): string {
    let year = tiempo.getFullYear()
    let mes = tiempo.getMonth() + 1 < 10 ? '0' + (tiempo.getMonth() + 1) : (tiempo.getMonth() + 1)
    let dia = tiempo.getDate() < 10 ? '0' + tiempo.getDate() : tiempo.getDate()

    return `${year}-${mes}-${dia}`
  }

  generarPDF(tituloColumnas: string[], contenidoFilas, nombreArchivo: string, orientation?: string) {

    var doc
    if (orientation === 'h') {
      doc = new jsPDF({
        orientation: 'landscape'
      });
    } else {
      doc = new jsPDF()
    }
 
    

    doc.autoTable({
      headStyles: { fillColor: [11, 21, 170] },
      head: [tituloColumnas],
      body: [
        //Una array de los de abajo por cada fila del pdf
        ...contenidoFilas

      ]
    });

    doc.save(`${nombreArchivo.replace(' ', '_')}.pdf`);
  }
}