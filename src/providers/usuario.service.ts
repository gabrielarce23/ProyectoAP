import { UtilsServiceProvider } from './utils.service';

import { Usuario, Perfil } from './../models/usuario.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { Subject } from 'rxjs/Subject';
import { Categoria } from '../models/categoria.models';
import { Platform } from 'ionic-angular';

@Injectable()
export class UsuarioService {

    apiUrl: string = ''
    token: string;
    usuario: Usuario

    usuConectado : Observable<Usuario>
    private usuSubject: Subject<Usuario>

    constructor(private http: HttpClient, private storage: Storage, private util: UtilsServiceProvider, private platform: Platform) {
        this.apiUrl = this.util.apiUrl
        this.usuSubject = new Subject<Usuario>()
        this.usuConectado = this.usuSubject.asObservable()
        
    }

    public getUserByToken(): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")

        headers = headers.set('x-auth', this.token)
      
        return this.http.get<any>(this.apiUrl + 'api/usuarios/' + this.token,{headers})

    }

    public getCuenta(id: string): Observable<any>{
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")

        headers = headers.set('x-auth', this.token)

        return this.http.get(`${this.apiUrl}api/usuarios/cuenta/${id}`, { headers })

    }


    public async recuperoUsuario() {
        try {
           
           
                let token = await this.storage.get('apiToken')
              
                if (token) {
                    
                    this.token = token;
                   
                    let resp = await this.getUserByToken().toPromise()
                    this.setUsuario(resp.data.usuario)
                    return
                }
                return this.usuSubject.next(undefined)
            
            
        }
        catch (e) {
            console.log(e)
            this.token = undefined
            return this.usuSubject.next(undefined)
        }
    }

    public actualizarUsuario(usuario: Usuario): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")

        headers = headers.set('x-auth', this.token)

        return this.http.put(`${this.apiUrl}api/usuarios/${usuario._id}`, usuario, { headers })
    }

    public async login(usuario: Usuario) {

        try{
            let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")
            let respLogin: any = await  this.http.post(`${this.apiUrl}api/usuarios/login`, usuario, { headers }).toPromise()

            if(respLogin.usuario){
                this.setUsuario(respLogin.usuario)
                return this.usuario
            }
            return undefined
        }
        catch(e){
            console.log(e)
            return undefined
        }

        
    }
    registrarPush( data : {platform: string, token : string}): Observable<any>{
     
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")

        headers = headers.set('x-auth', this.token)

        return this.http.put(`${this.apiUrl}api/usuarios/${this.usuario._id}/push`, data, { headers })
    }

    public setUsuario(usuario: Usuario) {
        
        this.storage.set('apiToken', usuario.tokens[0].token)
        this.token = usuario.tokens[0].token
        this.usuario = usuario
     
        this.usuSubject.next(this.usuario)
        
    }

    public logOut() {
        let token : string = this.platform.is('mobile') ? 'mobile' : 'desktop'
        this.quitarpush(token).subscribe((resp)=>{},(err)=>{console.log(err)})
        this.token = ''
        this.usuario = undefined
       
        this.usuSubject.next(this.usuario)
        return this.storage.remove('apiToken')

    }

    private quitarpush(platform: string): Observable<any>{
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")

        headers = headers.set('x-auth', this.token)

        return this.http.put(`${this.apiUrl}api/usuarios/${this.usuario._id}/unpush`, {platform}, { headers })
    }

    public altaUsuario(usu: Usuario): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")

        headers = headers.set('x-auth', this.token)

        return this.http.post(`${this.apiUrl}api/usuarios`, usu, { headers })
    }
    
    public modificarPerfil(usu: Usuario): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")

        headers = headers.set('x-auth', this.token)

        return this.http.put(`${this.apiUrl}api/usuarios/perfiles`, usu, { headers })
    }

    public getRoles(rolesId: string[]): Observable<any>{
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")

        headers = headers.set('x-auth', this.token)

        return this.http.post(`${this.apiUrl}api/roles`, {rolesId}, { headers })
    }

    public modificarPassword(data : any): Observable<any>{
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")

        headers = headers.set('x-auth', this.token)
       
        return this.http.put(`${this.apiUrl}api/usuarios/password`, data, { headers })
    }

    public recuperoPassword(email: string): Observable<any>{
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")       
        return this.http.post(`${this.apiUrl}api/usuarios/password`, {email}, { headers })
    }

    seleccionarPerfil(perfil : Perfil){
        
        this.usuario.perfiles = [perfil]
        
        this.usuSubject.next(this.usuario)

    }

    

}