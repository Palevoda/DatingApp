import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Group } from '../_models/group';
import { Message } from '../_models/message';
import { User } from '../_models/user';
import { GetPaginatedResult, GetPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  baseUrl = environment.apiUrl;
  hubUrl = environment.hubUrl;
  private hubConnection!: HubConnection;
  private messageThredSource = new BehaviorSubject<Message[]>([]);
  messageThread$ = this.messageThredSource.asObservable();

  constructor(private http: HttpClient) {

  }

  createHubConnection(user: User, otherUsername: string) {
    this.hubConnection = new HubConnectionBuilder()
    .withUrl(this.hubUrl + 'message?user=' + otherUsername, {accessTokenFactory: () => user.token})
    .withAutomaticReconnect()
    .build();

    this.hubConnection.start().catch(error=>console.log(error));

    this.hubConnection.on('ReceiveMessageThread', messages => {
      this.messageThredSource.next(messages);
    });

    this.hubConnection.on('NewMessage', message => {
      this.messageThread$.pipe(take(1)).subscribe(messages => {
        this.messageThredSource.next([...messages, message]);
      })
    })

    this.hubConnection.on('UpdateGroup', (group: Group) => {
      if (group.connections.some(x=>x.username === otherUsername)){
        this.messageThread$.pipe(take(1)).subscribe(messages => {
          messages.forEach(message => {
            if (!message.dateRead)
            {
              message.dateRead = new Date(Date.now())
            }
          })
          this.messageThredSource.next([...messages]);
        })
      }
    })
  } 

  stopHubConnection() {
    if(this.hubConnection)
    this.hubConnection.stop();
  }

  getMessages(pageNumber : Number, pageSize : Number, container : string){
    let params = GetPaginationHeaders(pageNumber, pageSize);
    params = params.append('Container', container);
    return GetPaginatedResult<Message[]>(this.baseUrl + 'messages', params, this.http);
  }

  getMessageThread(username : string){
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + username);
  }

  async sendMessage(username: string, content: string) {
    //return this.http.post<Message>(this.baseUrl + 'messages', {recipientUsername: username, content});
    this.hubConnection.invoke('SendMessage', {recipientUsername: username, content})
  }

  deleteMessage(id : number){
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }

}
