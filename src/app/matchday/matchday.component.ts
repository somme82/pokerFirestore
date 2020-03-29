import { Component, OnInit } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
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

  constructor(private firestore: AngularFirestore, public globalVars: GlobalVars, public dialog: MatDialog) { 
    this.globalVars.page='matchdays'
  }

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
      this.globalVars.venue = this.globalVars.matchdaysMap.get(this.globalVars.matchdayId).data.playerName;
      this.globalVars.date = this.globalVars.matchdaysMap.get(this.globalVars.matchdayId).data.date.toDate();
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
      this.globalVars.venue = this.globalVars.matchdaysMap.get(this.globalVars.matchdayId).data.playerName;
      this.globalVars.date = this.globalVars.matchdaysMap.get(this.globalVars.matchdayId).data.date.toDate();
    }
  }

  private swipeCoord?: [number, number];
  private swipeTime?: number;

  swipe(e: TouchEvent, when: string): void {
    const coord: [number, number] = [e.changedTouches[0].pageX, e.changedTouches[0].pageY];
    const time = new Date().getTime();

    if (when === 'start') {
      console.log('start')
      this.swipeCoord = coord;
      this.swipeTime = time;
    }

    else if (when === 'end') {
      const direction = [coord[0] - this.swipeCoord[0], coord[1] - this.swipeCoord[1]];
      const duration = time - this.swipeTime;

      if (duration < 1000 //Short enough
        && Math.abs(direction[1]) < Math.abs(direction[0]) //Horizontal enough
        && Math.abs(direction[0]) > 30) {  //Long enough
        const swipe = direction[0] < 0 ? 'next' : 'previous';
        if(swipe == 'next'){
          this.getNextMatchday();
        } else{
          this.getPreviousMatchday();
        }
      }
    }
  }

}
