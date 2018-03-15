import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Message } from '../interfaces/message.interface.ts';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';


@Injectable()
export class ChatService {

  private itemsCollection: AngularFirestoreCollection<Message>;
  public chats: Message[] = [];
  public user: any = {};

  constructor(private afs: AngularFirestore, public afAuth: AngularFireAuth) {
    this.afAuth.authState.subscribe( user => {
      console.log('User State: ', user);

      if (!user) {
        return;
      }

      this.user.name = user.displayName;
      this.user.uid = user.uid;
    })
  }

  login( provider ) {
    if (provider === 'google') {
      this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    } else {
      this.afAuth.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider());
    }
  }
  logout() {
    this.user = {};
    this.afAuth.auth.signOut();
  }

  loadMessages(){
    this.itemsCollection = this.afs.collection<Message>('chats', ref => ref.orderBy('date','desc').limit(5));

    return this.itemsCollection.valueChanges()
                                .map( ( messages: Message[])=>{
                                  console.log(messages);

                                  this.chats = []; //empty the array of messages

                                  for ( let message of messages ){
                                    this.chats.unshift( message );
                                  }

                                  //this.chats = messages;
                                })
  }

  addMessage( text: string ){

    let message: Message = {
      name: this.user.name,
      message: text,
      date: new Date().getTime(),
      uid: this.user.uid
    }

    return this.itemsCollection.add(message);
  }
}
