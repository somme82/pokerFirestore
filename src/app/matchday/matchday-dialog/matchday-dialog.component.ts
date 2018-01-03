import { Component, OnInit } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';
import {GlobalVars} from '../../../GlobalVars';
import {Score} from '../../Score';

@Component({
  selector: 'my-matchday-dialog',
  templateUrl: './matchday-dialog.component.html',
  styleUrls: ['./matchday-dialog.component.css']
})
export class MatchdayDialogComponent implements OnInit {
  scoreCollection: AngularFirestoreCollection<Score>;
  score: any
  constructor(private firestore: AngularFirestore, public globalVars: GlobalVars) { }

  ngOnInit() {
  }

  deleteMatchday(){
    this.scoreCollection = this.firestore.collection('scores', ref => ref.where('matchday', '==', this.globalVars.matchdayId));
    this.score = this.scoreCollection.snapshotChanges()
      .map(actions => {
        return actions.map( a => {
          const data = a.payload.doc.data() as Score;
          const id = a.payload.doc.id;
          return {id, data};
        });
      });

    this.score.subscribe(sc => {
      this.score = sc;
      if (this.score && this.score.length > 0) {
        this.score.forEach(s =>{
            this.firestore.doc('scores/' + s.id).delete();
          }
        );
      }
    });
    this.firestore.doc('matchdays/' + this.globalVars.matchdayId).delete();


  }

}
