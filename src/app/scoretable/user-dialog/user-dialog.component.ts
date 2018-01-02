import { Component, OnInit } from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';

@Component({
  selector: 'my-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.css']
})
export class UserDialogComponent implements OnInit {

  userName: string;
  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
  }

  insertPlayer()
  {
    this.firestore.collection("players").add({
      name: this.userName
    });
  }
}
