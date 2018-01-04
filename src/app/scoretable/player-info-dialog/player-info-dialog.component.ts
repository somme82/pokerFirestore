import { Component, OnInit } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';
import {Score} from '../../Score';
import {GlobalVars} from '../../../GlobalVars';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'my-player-info-dialog',
  templateUrl: './player-info-dialog.component.html',
  styleUrls: ['./player-info-dialog.component.css']
})
export class PlayerInfoDialogComponent implements OnInit {

  scoreCollection: AngularFirestoreCollection<Score>;
  scores: any;

  constructor(private firestore: AngularFirestore, public globalVars: GlobalVars) { }

  ngOnInit() {
    let start = new Date(this.globalVars.currentYear + '-01-01');
    let end = new Date(this.globalVars.currentYear + '-12-31');
    this.scoreCollection = this.firestore.collection('scores', ref =>
      ref.where('player', '==', this.globalVars.selectedPlayer)
        .where('matchdayDate', '>', start)
        .where('matchdayDate', '<', end)
        .orderBy('matchdayDate', 'asc'));
    this.scores = this.scoreCollection.snapshotChanges()
      .map(actions => {
        return actions.map( a => {
          const data = a.payload.doc.data() as Score;
          const id = a.payload.doc.id;
          return {id, data};
        });
      });
  }

}
