import { Component, OnInit } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';
import {GlobalVars} from '../../../GlobalVars';
import {Matchday} from '../../Matchday';
import {Player} from '../../Player';

@Component({
  selector: 'my-user-to-matchday-dialog',
  templateUrl: './user-to-matchday-dialog.component.html',
  styleUrls: ['./user-to-matchday-dialog.component.css']
})
export class UserToMatchdayDialogComponent implements OnInit {

  playersCollection: AngularFirestoreCollection<Player>;
  players: any;

  constructor(private firestore: AngularFirestore, private globalVars: GlobalVars) { }

  ngOnInit() {
    this.playersCollection = this.firestore.collection('players', ref => ref.orderBy('name', 'asc'));
    this.players = this.playersCollection.snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Matchday;
          const id = a.payload.doc.id;
          return {id, data};
        });
      });
  }


  insertPlayer(playerid){
    this.firestore.collection("scores").add({
      chips: 0,
      totalscore: 0,
      buyin: 10,
      player: playerid,
      matchday: this.globalVars.matchdayId
    });
  }

}
