import { Evento } from './../models/evento.models';
import { TipoEvento } from './../models/tipo.evento.models';
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { UtilsServiceProvider } from './utils.service';
import { UsuarioService } from './usuario.service';
import { Usuario } from '../models/usuario.model';

@Injectable()
export class EventoService {
    apiUrl : string = ''
    constructor(public http: HttpClient, public utils: UtilsServiceProvider, public usuarioServ: UsuarioService){
        this.apiUrl = this.utils.apiUrl
    }
    
    obtenerTipoEventos():Observable<TipoEvento[]>{
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")
        headers = headers.set('x-auth', this.usuarioServ.token)
        return this.http.get<any>(`${this.apiUrl}api/tipoeventos`, { headers })
        
    }

    altaEvento(evento : Evento): Observable<any>{
        
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")
        headers = headers.set('x-auth', this.usuarioServ.token)
        return this.http.post<any>(`${this.apiUrl}api/eventos`,evento, { headers })
    }

    obtenerEventos(fechaInicio: number, fechaFin: number, usuarioId ?: string): Observable<any>{
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")
        headers = headers.set('x-auth', this.usuarioServ.token)
        let params : HttpParams = new HttpParams().set('fechaInicio', fechaInicio.toString());
        params = params.set('fechaFin', fechaFin.toString());
        if(usuarioId){
            params = params.set('userId',usuarioId)
        }
        return this.http.get<any>(`${this.apiUrl}api/eventos`, { headers, params })
    }

    modificarEvento(evento: Evento, notificar: boolean): Observable<any>{
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")
        headers = headers.set('x-auth', this.usuarioServ.token)
        let params : HttpParams = new HttpParams().set('notificar', ''+notificar);
        return this.http.put<any>(`${this.apiUrl}api/eventos/${evento._id}`,evento, { headers,params })
    }

    getEvento(eventoId: string): Observable<any>{
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")
        headers = headers.set('x-auth', this.usuarioServ.token)
        return this.http.get<any>(`${this.apiUrl}api/eventos/${eventoId}`,{ headers })
    }

    cancelarEvento(evento: Evento){
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")
        headers = headers.set('x-auth', this.usuarioServ.token)
        
        return this.http.delete<any>(`${this.apiUrl}api/eventos/${evento._id}`, { headers })
    }
    confirmar(usuario : Usuario, asiste: boolean, idEvento: string){
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")
        headers = headers.set('x-auth', this.usuarioServ.token)
        return this.http.put<any>(`${this.apiUrl}api/eventos/${idEvento}/confirmar`,{usuario, asiste}, { headers})
    }
    obtenerComentario(idUsuario: string, idEvento: string): Observable<any>{
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")
        headers = headers.set('x-auth', this.usuarioServ.token)
        let params : HttpParams = new HttpParams().set('idUsuario', idUsuario);
        return this.http.get<any>(`${this.apiUrl}api/eventos/${idEvento}/registrosDT`, { headers,params})
    }
    guardarComentario(idUsuario: string, idEvento: string, comentario:string): Observable<any>{
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")
        headers = headers.set('x-auth', this.usuarioServ.token)
        
        return this.http.put<any>(`${this.apiUrl}api/eventos/${idEvento}/registrosDT`,{jugadorId: idUsuario, comentario}, { headers})
    }

    obtenerEventosHome(usuarioId: string, catId:string){
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/json")
        headers = headers.set('x-auth', this.usuarioServ.token)
        let params : HttpParams = new HttpParams().set('usuarioId', usuarioId);
        params = params.set('catId', catId);
        return this.http.get<any>(`${this.apiUrl}api/eventos/home`, { headers,params})
    }
}