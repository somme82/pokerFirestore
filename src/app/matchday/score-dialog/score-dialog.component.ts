import { Component, OnInit } from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import {Score} from '../../Score';
import {GlobalVars} from '../../../GlobalVars';
import {Player} from '../../Player';

@Component({
  selector: 'my-score-dialog',
  templateUrl: './score-dialog.component.html',
  styleUrls: ['./score-dialog.component.css']
})
export class ScoreDialogComponent implements OnInit {

  selectedScore: AngularFirestoreDocument<Score>;
  score: any;

  selectedPlayer: AngularFirestoreDocument<Player>;
  player: any;



  constructor(private firestore: AngularFirestore, public globalVars: GlobalVars) { }

  ngOnInit()
  {
      this.selectedScore = this.firestore.doc("scores/" + this.globalVars.selectedScore);
      this.score = this.selectedScore.valueChanges();
      this.score.subscribe(value => {
        this.score = value;
      });

      this.selectedPlayer = this.firestore.doc("players/" + this.globalVars.selectedPlayer);
      this.player = this.selectedPlayer.valueChanges();
      this.player.subscribe(value =>{
        this.player = value;
        this.player.name = value.name;
      })
  }

  insertScore() {
    this.firestore.doc("scores/" + this.globalVars.selectedScore).update({
      chips: this.score.chips,
      buyin: this.score.buyin,
      totalscore: (this.score.chips - this.score.buyin)
    });
    this.globalVars.closeDialog();
  }
  deleteScore() {
    this.selectedScore.delete();
    this.globalVars.selectedScore = '';
    this.globalVars.closeDialog();
  }
}
