import {Component, OnInit} from '@angular/core';
// Librerias para socket
import {Client} from "@stomp/stompjs";
import * as SockJS from "sockjs-client";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  private client: Client;

  constructor() {
  }

  ngOnInit(): void {
    this.client = new Client();
    // Inicializando la conexion con el socket
    this.client.webSocketFactory = () => {
      return new SockJS(environment.socketUrl + 'chat-websocket');
    }

    // Inicializando la conexion
    this.client.onConnect = (frame) => {
      console.log("Esta conectado al servidor =\t"+ this.client.connected);
      console.log("frame =\t"+ frame);
    };

    // Activando la conexion
    this.client.activate();
  }

}
