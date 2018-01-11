import { Component, OnInit } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import {Matchday} from '../Matchday';
import {Score} from '../Score';
import {Player} from '../Player';
import {MatDialog} from '@angular/material';
import {GlobalVars} from '../../GlobalVars';
import {MatchdayDialogComponent} from './matchday-dialog/matchday-dialog.component';
import {UserToMatchdayDialogComponent} from './user-to-matchday-dialog/user-to-matchday-dialog.component';
import {ScoreDialogComponent} from './score-dialog/score-dialog.component';
import {Observable} from 'rxjs/Observable';
import {ArticleDialogComponent} from './article-dialog/article-dialog.component';

@Component({
  selector: 'my-matchday',
  templateUrl: './matchday.component.html',
  styleUrls: ['./matchday.component.css']
})
export class MatchdayComponent implements OnInit {

  players: any;

  scores: any;

  matchday: any;
  matchdayCollection: AngularFirestoreCollection<Matchday>;
  matchdays: any;

  constructor(private firestore: AngularFirestore, public globalVars: GlobalVars, public dialog: MatDialog) { }

  ngOnInit(): void {

  }

  openScoreDialog() {
    this.dialog.open(ScoreDialogComponent, {
      panelClass: 'fnpc-dialog'
    });
  }

  openNewUserDialog() {
    this.dialog.open(UserToMatchdayDialogComponent, {
      panelClass: 'fnpc-dialog',
    });
  }

  openMatchdayDialog() {
    this.dialog.open(MatchdayDialogComponent, {
      panelClass: 'fnpc-dialog',
    });
  }

  openArticleDialog() {
    this.dialog.open(ArticleDialogComponent, {
      panelClass: 'fnpc-dialog',
    });
  }

  getNextMatchday(){
    var index = this.globalVars.matchdaysByYear.get(this.globalVars.currentYear).findIndex(m=>m.id == this.globalVars.matchdayId) + 1;
    if ((this.globalVars.matchdaysByYear.get(this.globalVars.currentYear).length -1) >= index){
      var nextMatchday = this.globalVars.matchdaysByYear.get(this.globalVars.currentYear)[index];

      this.globalVars.currentMatchdayResultsObservable =
        Observable.of(nextMatchday.results)
      this.globalVars.matchdayId = nextMatchday.id;
      this.globalVars.venue = this.globalVars.matchdaysMap.get(this.globalVars.matchdayId).data.playername;
      this.globalVars.date = this.globalVars.matchdaysMap.get(this.globalVars.matchdayId).data.date;
    }

  }

  getPreviousMatchday(){
    var index = this.globalVars.matchdaysByYear.get(this.globalVars.currentYear).findIndex(m=>m.id == this.globalVars.matchdayId) - 1
    if (index >= 0) {
      var previousMatchday = this.globalVars.matchdaysByYear.get(this.globalVars.currentYear)
        [index];

      this.globalVars.currentMatchdayResultsObservable =
        Observable.of(previousMatchday.results)
      this.globalVars.matchdayId = previousMatchday.id;
      this.globalVars.venue = this.globalVars.matchdaysMap.get(this.globalVars.matchdayId).data.playername;
      this.globalVars.date = this.globalVars.matchdaysMap.get(this.globalVars.matchdayId).data.date;
    }
  }
}
