import { SaldosPlantelPage } from './../pages/saldos-plantel/saldos-plantel';
import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { AngularFireModule } from 'angularfire2';
import 'firebase/messaging'; // only import firebase messaging or as needed;
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { CalendarModule } from 'ionic3-calendar-en';
import { firebaseConfig } from '../enviroment';
import { AltaConceptosDeCajaPage } from '../pages/Backoffice/alta-conceptos-de-caja/alta-conceptos-de-caja';
import { ConceptosDeCajaPage } from '../pages/Backoffice/conceptos-de-caja/conceptos-de-caja';
import { MantenimientoFechaPage } from '../pages/Backoffice/mantenimiento-fecha/mantenimiento-fecha';
import { MantenimientoCampeonatosPage } from '../pages/common/mantenimiento-campeonatos/mantenimiento-campeonatos';
import { RegistroMovCajaPage } from '../pages/Contabilidad/registro-mov-caja/registro-mov-caja';
import { SaldoMovimientosCategoriaPage } from '../pages/Contabilidad/saldo-movimientos-categoria/saldo-movimientos-categoria';
import { DatosDeportivosListaPage } from '../pages/datos-deportivos-lista/datos-deportivos-lista';
import { DetalleFechaPage } from '../pages/detalle-fecha/detalle-fecha';
import { DetalleMovimientoPage } from '../pages/detalle-movimiento/detalle-movimiento';
import { DetallePagoPage } from '../pages/detalle-pago/detalle-pago';
import { DetallesEventoPage } from '../pages/detalles-evento/detalles-evento';
import { HomePage } from '../pages/home/home';
import { ListaCategoriasPage } from '../pages/lista-categorias/lista-categorias';
import { ListaEventosPage } from '../pages/lista-eventos/lista-eventos';
import { ModificacionPeriflesPage } from '../pages/modificacion-perifles/modificacion-perifles';
import { PagosPendientesPage } from '../pages/pagos-pendientes/pagos-pendientes';
import { PlaceHolderPage } from '../pages/place-holder/place-holder';
import { SaldosJugadoresPage } from '../pages/saldos-jugadores/saldos-jugadores';
import { EventoService } from '../providers/evento.service';
import { FirebaseMessagingProvider } from '../providers/firebase-messaging';
import { UtilsServiceProvider } from '../providers/utils.service';
import { TouchedWorkaroundDirective } from './../directives/touched-workaround.directive';
import { AltaDeUsuarioPage } from './../pages/Backoffice/alta-usuario/alta-de-usuario';
import { MantenimientoCategoriaPage } from './../pages/Backoffice/mantenimiento-categoria/mantenimiento-categoria';
import { MantenimientoTipoEventosPage } from './../pages/Backoffice/mantenimiento-tipo-eventos/mantenimiento-tipo-eventos';
import { TipoEventosPage } from './../pages/Backoffice/tipo-eventos/tipo-eventos';
import { ListaCampeonatosPage } from './../pages/common/lista-campeonatos/lista-campeonatos';
import { LoginPage } from './../pages/common/login/login';
import { ConsultaModificacionDatosPage } from './../pages/consulta-modificacion-datos/consulta-modificacion-datos';
import { DetalleComentarioPage } from './../pages/detalle-comentario/detalle-comentario';
import { ListaRegistroEventoPage } from './../pages/lista-registro-evento/lista-registro-evento';
import { ModificacionDatosPage } from './../pages/modificacion-datos/modificacion-datos';
import { ModificarComentarioPage } from './../pages/modificar-comentario/modificar-comentario';
import { ModificarEventoPage } from './../pages/modificar-evento/modificar-evento';
import { ModificarPasswordPage } from './../pages/modificar-password/modificar-password';
import { RegistroPagoCuotaPage } from './../pages/registro-pago-cuota/registro-pago-cuota';
import { UsuariosEnCategoriaPage } from './../pages/usuarios-en-categoria/usuarios-en-categoria';
import { CampeonatoService } from './../providers/campeonato.service';
import { CategoriaService } from './../providers/categoria.service';
import { ConceptoService } from './../providers/concepto.service';
import { CuentaService } from './../providers/cuenta.service';
import { MenuService } from './../providers/menu.service';
import { TipoEventoService } from './../providers/tipoevento.service';
import { UsuarioService } from './../providers/usuario.service';
import { MyApp } from './app.component';
import { PlantelPage } from './../pages/plantel/plantel';
import { ModalPage } from './../pages/modal/modal';





@NgModule({
  declarations: [
    MyApp,
    PlaceHolderPage,
    HomePage,
    LoginPage,
    AltaDeUsuarioPage,
    TouchedWorkaroundDirective,
    MantenimientoCategoriaPage,
    AltaConceptosDeCajaPage,
    ConceptosDeCajaPage,
    TipoEventosPage,
    TouchedWorkaroundDirective,
    ListaCategoriasPage,
    MantenimientoTipoEventosPage,
    SaldoMovimientosCategoriaPage,
    RegistroMovCajaPage,
    UsuariosEnCategoriaPage,
    ModificacionPeriflesPage,
    ModificarPasswordPage,
    ListaCampeonatosPage,
    MantenimientoCampeonatosPage,
    MantenimientoFechaPage,
    ListaEventosPage,
    ModificarEventoPage,
    DetallesEventoPage,
    DetalleFechaPage,
    ModificacionDatosPage,
    ConsultaModificacionDatosPage,
    RegistroPagoCuotaPage,
    DetalleMovimientoPage,
    ListaRegistroEventoPage,
    ModificarComentarioPage,
    DatosDeportivosListaPage,
    DetalleComentarioPage,
    PagosPendientesPage,
    DetallePagoPage,
    SaldosJugadoresPage,
    PlantelPage,
    SaldosPlantelPage,
    ModalPage


  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      scrollPadding: false,
      scrollAssist: true,
      autoFocusAssist: false,
      backButtonText: ''
    }),
    CalendarModule,
    AngularFireModule.initializeApp(firebaseConfig),
    IonicStorageModule.forRoot(),
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    PlaceHolderPage,
    AltaDeUsuarioPage,
    LoginPage,
    MantenimientoCategoriaPage,
    ConceptosDeCajaPage,
    AltaConceptosDeCajaPage,
    TipoEventosPage,
    ListaCategoriasPage,
    MantenimientoTipoEventosPage,
    SaldoMovimientosCategoriaPage,
    RegistroMovCajaPage,
    UsuariosEnCategoriaPage,
    ModificacionPeriflesPage,
    ModificarPasswordPage,
    ListaCampeonatosPage,
    MantenimientoCampeonatosPage,
    MantenimientoFechaPage,
    ListaEventosPage,
    ModificarEventoPage,
    DetallesEventoPage,
    DetalleFechaPage,
    ModificacionDatosPage,
    ConsultaModificacionDatosPage,
    RegistroPagoCuotaPage,
    DetalleMovimientoPage,
    ListaRegistroEventoPage,
    ModificarComentarioPage,
    DatosDeportivosListaPage,
    DetalleComentarioPage,
    PagosPendientesPage,
    DetallePagoPage,
    SaldosJugadoresPage,
    PlantelPage,
    SaldosPlantelPage,
    ModalPage


  ],
  providers: [
    FirebaseMessagingProvider,
    UsuarioService,
    CategoriaService,
    ConceptoService,
    StatusBar,
    SplashScreen,
    UtilsServiceProvider,
    TipoEventoService,
    CuentaService,
    MenuService,
    CampeonatoService,
    EventoService,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
