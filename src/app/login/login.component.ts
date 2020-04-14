import { Component, OnInit } from '@angular/core';
import {GlobalVars} from '../../GlobalVars';
import { Router } from '@angular/router';
import { auth } from 'firebase/app';
import { AngularFireAuth} from '@angular/fire/auth';
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  username: string;
  password: string;
  angemeldet: boolean;

  constructor(private auth: AngularFireAuth, private firestore: AngularFirestore, public globalVars: GlobalVars, private router: Router) { 
    this.globalVars.page='login'
  }

  tryLogin(){    
    firebase.auth().signInWithEmailAndPassword(this.username, this.password).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode + ": " + errorMessage);
    });
    console.log("authState: " + this.auth.authState);
    
  }
  
  trySignOut(){
    firebase.auth().signOut().then(function() {
      console.log("abgemeldet")
    }).catch(function(error) {
      console.log(error.message)
    });
  }
}


