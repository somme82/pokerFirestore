import { Component, OnInit } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {GlobalVars} from '../../../GlobalVars';
import {Score} from '../../Score';

@Component({
  selector: 'app-matchday-dialog',
  templateUrl: './matchday-dialog.component.html',
  styleUrls: ['./matchday-dialog.component.css']
})
export class MatchdayDialogComponent implements OnInit {
  scoreCollection: AngularFirestoreCollection<Score>;
  score: any
  constructor(private firestore: AngularFirestore, public globalVars: GlobalVars) { }

  scoresOfMatchday: Array<Score> = new Array;

  totalChips: number = 0;
  totalBuyIn: number = 0;

  ngOnInit() {
    this.scoreCollection = this.firestore.collection('userscores', ref => ref.where('matchday', '==', this.globalVars.matchdayId));
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
            let score = new Score();
            score.id = s.id;
            score.buyin = s.data.buyin;
            score.chips = s.data.chips;
            this.totalBuyIn = Number(Number(this.totalBuyIn) + Number(s.data.buyin));
            this.totalChips = Number(Number(this.totalChips) + Number(s.data.chips));
            this.scoresOfMatchday.push(score);
          }
        );
      }
    });
    console.log(this.totalBuyIn)
    console.log(this.totalChips)
  }

  deleteMatchday(){

    if ( this.scoresOfMatchday && this.scoresOfMatchday.length > 0){
      this.scoresOfMatchday.forEach(s => {
        this.firestore.doc('userscores/' + s.id).delete();
      })
    }

    this.firestore.doc('gamedays/' + this.globalVars.matchdayId).delete();
    this.globalVars.closeAllDialogs();

  }

}
