import { Component, OnInit } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {GlobalVars} from '../../../GlobalVars';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.css']
})
export class UserDialogComponent implements OnInit {

  userName: string;
  constructor(private firestore: AngularFirestore, public globalVars: GlobalVars) {}

  ngOnInit() {
  }

  insertPlayer()
  {
    this.firestore.collection("players").add({
      name: this.userName
    });
    this.globalVars.closeAllDialogs();
  }
}
