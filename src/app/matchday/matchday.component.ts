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

@Component({
  selector: 'my-matchday',
  templateUrl: './matchday.component.html',
  styleUrls: ['./matchday.component.css']
})
export class MatchdayComponent implements OnInit {

  playersCollection: AngularFirestoreCollection<Player>;
  players: any;

  venue: string = '';
  date: Date;

  scoreCollection: AngularFirestoreCollection<Score>;
  scores: any;


  selectedMatchday: AngularFirestoreDocument<Matchday>;
  matchday: any;


  matchdayCollection: AngularFirestoreCollection<Matchday>;
  matchdays: any;

  playersMap: Map<string, string> = new Map<string, string>();



  constructor(private firestore: AngularFirestore, public globalVars: GlobalVars, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.playersCollection = this.firestore.collection('players', ref => ref.orderBy('name', 'asc'));
    this.players = this.playersCollection.snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Matchday;
          const id = a.payload.doc.id;
          return {id, data};
        });
      });

    this.players.subscribe( p => {
      this.players = p;
      if (this.players && this.players.length > 0) {
        this.players.forEach(player => {
          if (!this.playersMap.has(player.data.name))
          {
            this.playersMap.set(player.id, player.data.name);
          }
        });
      }
    });
    this.setMatchdays();



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

  getScore( playerid, scoreid ) {
    this.globalVars.selectedPlayer = playerid;
    this.globalVars.selectedScore = scoreid;
  }

  public setMatchdays()
  {
    let start = new Date(this.globalVars.currentYear + '-01-01');
    let end = new Date(this.globalVars.currentYear + '-12-31');

    this.matchdayCollection = this.firestore.collection('matchdays', ref => ref
      .where('date', '>', start)
      .where('date', '<', end)
      .orderBy('date', 'asc'));
    this.matchdays = this.matchdayCollection.snapshotChanges()
      .map(actions => {
        return actions.map( a => {
          const data = a.payload.doc.data() as Matchday;
          const id = a.payload.doc.id;
          return {id, data};
        });
      });

      this.matchdays.subscribe(md => {
        this.matchdays = md;
        if (this.matchdays && this.matchdays.length > 0) {
          this.globalVars.matchdayId = this.matchdays[this.matchdays.length - 1].id;
          this.getScoreOfMatchday();
        }
      });
  }

  getScoreOfMatchday()
  {
    this.scoreCollection = this.firestore.collection('scores', ref => ref.where('matchday', '==', this.globalVars.matchdayId).orderBy('totalscore', 'desc'));
    this.scores = this.scoreCollection.snapshotChanges()
      .map(actions => {
        return actions.map( a => {
          const data = a.payload.doc.data() as Score;
          const playername = this.playersMap.get(data.player);
          const id = a.payload.doc.id;
          return {id, playername, data};
        });
      });

    this.scores.subscribe(score=>{
      score.forEach(s=>{
        this.imageExists(s);
      })
      this.scores = Observable.of(score);
    });


    this.selectedMatchday = this.firestore.doc("matchdays/" + this.globalVars.matchdayId);
    this.matchday = this.selectedMatchday.snapshotChanges();
    this.matchday.subscribe(value => {
      if (this.playersMap.has(value.payload.data().venue))
      {
        this.venue = this.playersMap.get(value.payload.data().venue);
      }else{
        this.venue = value.payload.data().venue;
      }

      this.date = value.payload.data().date;
    });
  }

  getNextMatchday(){
    this.matchdays = this.getMatchdaySnapshotChanges();
    this.matchdays.subscribe(md => {
      this.matchdays = md;
      if (this.matchdays && this.matchdays.length > 0) {
        var index = 0;

        this.matchdays.forEach(matchday => {
          if (matchday.id == this.globalVars.matchdayId && index !== this.matchdays.length -1)
          {
            this.globalVars.matchdayId = this.matchdays[index +1].id;
          } else{
            index ++;
          }
        });
      }
      this.getScoreOfMatchday();

    });

  }

  getPreviousMatchday(){
    this.matchdays = this.getMatchdaySnapshotChanges();
    this.matchdays.subscribe(md => {
      this.matchdays = md;
      if (this.matchdays && this.matchdays.length > 0) {
        var index = 0;

        this.matchdays.forEach(matchday => {
          if (matchday.id == this.globalVars.matchdayId && index !== 0)
          {
            this.globalVars.matchdayId = this.matchdays[index -1].id;
          }
          index ++;
        });
      }
      this.getScoreOfMatchday();

    });
  }

  getMatchdaySnapshotChanges()
  {
    return this.matchdayCollection.snapshotChanges()
      .map(actions => {
        return actions.map( a => {
          const data = a.payload.doc.data() as Matchday;
          const id = a.payload.doc.id;
          return {id, data};
        });
      });
  }

  imageExists(score) {
    var image = new Image();
    image.onload = function(){
      score.hasImage = true;
    };
    image.onerror = function(){
      score.hasImage = false;
    };
    image.src = "../../assets/avatar/" + score.playername.toLowerCase() + ".jpg";
  }


}
