import { Encuesta } from '../models/encuesta.models';
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { UtilsServiceProvider } from './utils.service';
import { UsuarioService } from './usuario.service';
import { Usuario } from '../models/usuario.model';

@Injectable()
export class EncuestaService {
    apiUrl: string = ''
    constructor(public http: HttpClient, public utils: UtilsServiceProvider, public usuarioServ: UsuarioService) {
        this.apiUrl = this.utils.apiUrl
    }


    obtenerEncuestas(): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")
        headers = headers.set('x-auth', this.usuarioServ.token)
        return this.http.get<any>(`${this.apiUrl}api/encuestas`, { headers })
    }

    votar(idEncuesta: string, voto: string) {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")
        headers = headers.set('x-auth', this.usuarioServ.token)
        return this.http.put<any>(`${this.apiUrl}api/encuestas/${idEncuesta}/voto`, { voto }, { headers })
    }

    getVotos(idEncuesta: string) {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")
        headers = headers.set('x-auth', this.usuarioServ.token)
        return this.http.get<any>(`${this.apiUrl}api/encuestas/${idEncuesta}/voto`, { headers })
    }


}