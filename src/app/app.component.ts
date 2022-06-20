import { PlaceHolderPage } from './../pages/place-holder/place-holder';

import { Menu, MenuItem } from './../models/menu.models';
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { MenuController, Nav, NavController, Platform, App, IonicApp } from 'ionic-angular';
import { LoginPage } from '../pages/common/login/login';
import { HomePage } from '../pages/home/home';
import { FirebaseMessagingProvider } from '../providers/firebase-messaging';
import { Usuario } from './../models/usuario.model';
import { CEILOGO } from './../providers/constant';
import { EventoService } from './../providers/evento.service';
import { MenuService } from './../providers/menu.service';
import { UsuarioService } from './../providers/usuario.service';
import { UtilsServiceProvider } from './../providers/utils.service';
import { EncuestaService } from '../providers/encuesta.service';





@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  usuario: Usuario
  rootPage: any = HomePage;
  nombreCategoria: string = ''
  pages: any = [];
  shownGroup: any;
  mostrar: boolean = false;
  pageHistory: string[] = [];//to track page history

  avatar: string = CEILOGO;

  roles: string[] = []
  @ViewChild(Nav) nav: NavController;

  constructor(private platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private _app: App, private _ionicApp: IonicApp,
    public usuarioServ: UsuarioService, public menuServ: MenuService, private eventServ: EventoService, private encuestaServ: EncuestaService,
    private fcmService: FirebaseMessagingProvider, private http: HttpClient, private _menu: MenuController, private utils: UtilsServiceProvider) {

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.setupBackButtonBehavior();

      statusBar.styleDefault();
      splashScreen.hide();

      if (window.location.host === 'localhost:8100') {
        this.utils.apiUrl = 'http://localhost:3000/'
        this.usuarioServ.apiUrl = this.utils.apiUrl
        this.eventServ.apiUrl = this.utils.apiUrl
        this.encuestaServ.apiUrl = this.utils.apiUrl
      }
    });


  }

  private setupBackButtonBehavior() {

    // If on web version (browser)
    if (window.location.protocol !== "file:") {

      // Register browser back button action(s)
      window.onpopstate = (evt) => {

        // Close menu if open
        if (this._menu.isOpen()) {
          this._menu.close();
          return;
        }

        // Close any active modals or overlays
        let activePortal = this._ionicApp._loadingPortal.getActive() ||
          this._ionicApp._modalPortal.getActive() ||
          this._ionicApp._toastPortal.getActive() ||
          this._ionicApp._overlayPortal.getActive();

        if (activePortal) {
          activePortal.dismiss();
          return;
        }

        // Navigate back
        if (this._app.getRootNav().canGoBack()) this._app.getRootNav().pop();

      };

      // Fake browser history on each view enter
      this._app.viewDidEnter.subscribe((app) => {
        history.pushState(null, null, "");
      });

    }

  }


  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.


  }

  async ngAfterContentInit() {
    //Called after ngOnInit when the component's or directive's content has been initialized.
    //Add 'implements AfterContentInit' to the class.
    try {
      let registro: boolean = window.location.hash.split('/').indexOf('registro') > 0
      if (!registro) {


        this.usuarioServ.usuConectado.subscribe(async (usu: Usuario) => {

          if (usu) {
            this.nav.setRoot(HomePage)
            if (this.usuarioServ.usuario && this.fcmService.token) {
              if (this.platform.platforms().indexOf('mobile') >= 0) {
                this.usuarioServ.registrarPush({ platform: 'mobile', token: this.fcmService.token }).subscribe((resp) => {

                }, (error) => {
                  console.log(error)
                })
              }
              else {
                this.usuarioServ.registrarPush({ platform: 'desktop', token: this.fcmService.token }).subscribe((resp) => {

                }, (error) => {
                  console.log(error)
                })
              }
            }


            this.usuario = usu
            if (this.usuario.perfiles.length === 0) {
              this.roles = ['Delegado Institucional']
              this.pages = await this.menuServ.menuDelegadoInstitucional(this.usuario)
              this.agregarAyuda()




            }
            else {
              if (this.usuario.perfiles.length === 1) {

                let resp = await this.usuarioServ.getRoles(this.usuario.perfiles[0].roles).toPromise()

                this.roles = resp.data.nombreRoles

                let menu = await this.menuServ.getMenu(this.usuario.perfiles[0].roles)
                if (this.menuServ.categoriasUsuario.length > 1) {
                  menu = [
                    ...menu,
                    await this.menuServ.switchCategoríaInterno()
                  ]
                }
                this.pages = menu
                this.agregarAyuda()
                this.nombreCategoria = await this.menuServ.nombreCategoria(this.usuario.perfiles[0].categoria)


              } else {
                this.roles = ['Seleccione categoría']
                this.pages = [await this.menuServ.switchCategoría(this.usuario)]
                this.agregarAyuda()
              }

            }

          } else {
            this.pages = []
            this.agregarAyuda()
            return this.nav.setRoot(LoginPage)
          }

        })

        await this.usuarioServ.recuperoUsuario()


      }
    } catch (e) {
      this.utils.dispararAlert('Error', 'Ocurrión un error con el servidor')
      console.log(e)
    }
  }

  ionViewDidLoad() {

  }

  showChild(page) {
    if (this.isSubmenuShown(page)) {
      this.shownGroup = null;
    } else {
      this.shownGroup = page;
    }
  }

  isSubmenuShown(page) {
    return this.shownGroup === page;
  }

  openPage(page) {
    if(page.sub_title==='Manual'){
      return window.open('https://sites.google.com/view/cei-app/', '_system')

    }
    if (!(page.component)) {
      this.showChild(page);
    } else {
      if (page.component.categoria) {

        this.menuServ.cambioCategoria(page.component.categoria).then(() => {

          this.shownGroup = null;
          this._menu.close();

        }).catch(() => {

        })
        return
      }
      this.shownGroup = null;
      this.nav.setRoot(page.component);
      this._menu.close();
    }
  }

  home() {
    this.nav.setRoot(HomePage)
    this._menu.close();
  }

  logout() {

    this.usuarioServ.logOut();
    this.usuario = undefined
    this.roles = []
    this.menuServ.categoriaSeleccionada = undefined
    this.menuServ.categoriasUsuario = []
    this.menuServ.perfilesUsuario = []
    this.nav.setRoot(LoginPage)
    this._menu.close()
    this.nombreCategoria = ''
  }

  agregarAyuda(){
    
    let menuAyuda = new Menu('Info','document','add')
    menuAyuda.sub.push(new MenuItem('Manual',HomePage))
    this.pages = [...this.pages, menuAyuda]
  }

  menuAyuda(nombre){
    return nombre === 'Info'
  }
}

