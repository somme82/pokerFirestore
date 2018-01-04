import { Component, OnInit } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import {Score} from '../../Score';
import {GlobalVars} from '../../../GlobalVars';
import {Observable} from 'rxjs/Observable';
import {Matchday} from '../../Matchday';
import {Player} from '../../Player';
import {forEach} from '@angular/router/src/utils/collection';

@Component({
  selector: 'my-player-info-dialog',
  templateUrl: './player-info-dialog.component.html',
  styleUrls: ['./player-info-dialog.component.css']
})
export class PlayerInfoDialogComponent implements OnInit {

  scoreCollection: AngularFirestoreCollection<Score>;
  scores: any;

  matchdayCollection: AngularFirestoreCollection<Matchday>;
  matchdays: any;

  playersCollection: AngularFirestoreCollection<Player>;
  players: any;

  playersMap: Map<string, string> = new Map<string, string>();
  matchdayMap: Map<string, string> = new Map<string, string>();

  constructor(private firestore: AngularFirestore, public globalVars: GlobalVars) { }

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
      let start = new Date(this.globalVars.currentYear + '-01-01');
      let end = new Date(this.globalVars.currentYear + '-12-31');
      this.matchdayCollection = this.firestore.collection('matchdays', ref =>
        ref.where('date', '>', start)
          .where('date', '<', end)
          .orderBy('date', 'asc'));
      this.matchdays = this.matchdayCollection.snapshotChanges()
        .map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data() as Score;
            const id = a.payload.doc.id;
            return {id, data};
          });
        });
      this.matchdays.subscribe(matchday => {
        matchday.forEach(m=>{
          if (this.playersMap.has(m.data.venue)){
            this.matchdayMap.set(m.id, this.playersMap.get(m.data.venue))
          }
        })
        console.log(matchday)
        console.log(this.matchdayMap)
      })


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

      this.scores.subscribe(score=>{ 
        if (score && score.length > 0){
          score.forEach(s=>{
            if (this.matchdayMap.has(s.data.matchday)){
              s.playername = this.matchdayMap.get(s.data.matchday);
            }
          })
        }
        console.log(score);
        this.scores = Observable.of(score);
      })
    });
  }

}
