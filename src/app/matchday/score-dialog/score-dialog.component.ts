import { Component, OnInit } from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import {Score} from '../../Score';
import {GlobalVars} from '../../../GlobalVars';

@Component({
  selector: 'my-score-dialog',
  templateUrl: './score-dialog.component.html',
  styleUrls: ['./score-dialog.component.css']
})
export class ScoreDialogComponent implements OnInit {

  selectedScore: AngularFirestoreDocument<Score>;
  score: any;


  constructor(private firestore: AngularFirestore, private globalVars: GlobalVars) { }

  ngOnInit()
  {
    this.selectedScore = this.firestore.doc("scores/" + this.globalVars.selectedScore);
    this.score = this.selectedScore.valueChanges();
    this.score.subscribe(value => {
      this.score = value;
      this.score.chips = value.chips;
      this.score.buyin = value.buyin;
    });

  }

  insertScore() {
    this.firestore.doc("scores/" + this.globalVars.selectedScore).update({
      chips: this.score.chips,
      buyin: this.score.buyin,
      totalscore: (this.score.chips - this.score.buyin)
    });
  }
  deleteScore() {
    this.firestore.doc("scores/" + this.globalVars.selectedScore).delete();
  }
}
