import { TipoEvento } from './tipo.evento.models';
import { Usuario } from './usuario.model';
import { Categoria } from './categoria.models';
export class Evento {
    _id: string = ''
    fecha: number = Date.now();
    nombre: String = '';
    tipoEvento: TipoEvento = new TipoEvento()
    lugar: Lugar = new Lugar()
    rival: String = ''
    invitados: Usuario[] = []
    confirmados: Usuario[] = []
    noAsisten: Usuario[] = []
    duda: Usuario[] = []
    registrosDT: any[] = []
    categoria: Categoria
    imagenQR: String = ''

}

export class Lugar {
    nombre: String = ''
    direccion: String = ''
    linkUbicacion = ''
}
