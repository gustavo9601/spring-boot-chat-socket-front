import {AfterContentChecked, ChangeDetectorRef, Component, OnInit} from '@angular/core';
// Librerias para socket
import {Client, IMessage} from "@stomp/stompjs";
import * as SockJS from "sockjs-client";
import {environment} from "../../environments/environment";
import {Mensaje} from "./models/mensaje";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterContentChecked {
  private client: Client;
  public conectado: boolean = false;
  public escribiendo: string = "";
  public mensajes: Mensaje[] = [];
  public mensaje: Mensaje = new Mensaje();

  constructor(private ref: ChangeDetectorRef) {
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
  }

  ngOnInit(): void {
    this.client = new Client();
    // Inicializando la conexion con el socket
    this.client.webSocketFactory = () => {
      return new SockJS(environment.socketUrl + 'chat-websocket');
    }

    // Inicializando la conexion
    this.client.onConnect = (frame) => {
      console.log("Esta conectado al servidor =\t" + this.client.connected);
      console.log("frame =\t" + frame);
      this.conectado = true;

      // /chat/mensaje // Escuchando el evento
      this.client.subscribe('/chat/mensaje', (message: IMessage) => {
        let mensaje: Mensaje = JSON.parse(message.body) as Mensaje;
        mensaje.fecha = new Date(mensaje.fecha).toString();
        console.log("mensaje recibido=\t", mensaje);

        if (!this.mensaje.color && mensaje.tipo == 'NUEVO_USUARIO' && this.mensaje.username == mensaje.username) {
          this.mensaje.color = mensaje.color;
        }


        this.mensajes.push(mensaje);
      });

      // Puiblicando un nuevo mensaje cuando se conecte uno nuevo
      this.mensaje.tipo = 'NUEVO_USUARIO';
      this.client.publish({destination: '/app/mensaje', body: JSON.stringify(this.mensaje)});


      // /chat/escribiendo // Escuchando el evento
      this.client.subscribe('/chat/escribiendo', (message: IMessage) => {
        console.log("escribiendo=\t" + message.body);
        this.escribiendo = message.body;
        setTimeout(() => {
          this.escribiendo = '';
        } , 500);
      });

    };

    // Desconectando del servidor
    this.client.onDisconnect = (frame) => {
      console.log("Esta desconectado del servidor =\t" + this.client.connected);
      console.log("frame =\t" + frame);
      this.conectado = false;
    }

  }

  conectar(): void {
    // Activando la conexion
    this.client.activate();
  }

  desconectar(): void {
    // Desactivando la conexion
    this.client.deactivate();
  }

  escribiendoEvento(): void {
    this.client.publish({destination: '/app/escribiendo', body: this.mensaje.username});
  }

  enviarMensaje(): void {
    this.mensaje.fecha = new Date().getTime().toString();
    this.mensaje.tipo = 'MENSAJE';
    console.log("mensaje =\t", this.mensaje);
    this.client.publish({destination: '/app/mensaje', body: JSON.stringify(this.mensaje)});
    this.mensaje.texto = ''; // resetea el texto
  }

}
