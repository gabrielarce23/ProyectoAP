import { Usuario } from './usuario.model';
export class Encuesta {
    _id: string = ''
    limite: String = '';
    extraInfo: String = '';
    nombre: String = '';
    activa: boolean = true;
    opciones: {_id: string, nombre: string, imagen: string, link: string} [] = [];
    veedores: string[] = [];
    habilitados: string[] = [];
    votos: {opcion: string, usuario: Usuario} [] = []
}
