import { Component, OnInit } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import {GlobalVars} from '../../../GlobalVars';
import {Matchday} from '../../Matchday';
import {Player} from '../../Player';
import {Score} from '../../Score';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'my-user-to-matchday-dialog',
  templateUrl: './user-to-matchday-dialog.component.html',
  styleUrls: ['./user-to-matchday-dialog.component.css']
})
export class UserToMatchdayDialogComponent implements OnInit {

  playersCollection: AngularFirestoreCollection<Player>;
  players: any;

  scoresCollection: AngularFirestoreCollection<Score>;
  scores: any;

  selectedMatchday: AngularFirestoreDocument<Matchday>;
  matchday: any;

  selectedPlayer: string;
  playersMap: Map<string, any> = new Map<string, any>()

  constructor(private firestore: AngularFirestore, public globalVars: GlobalVars) { }

  ngOnInit() {
    this.playersCollection = this.firestore.collection('players', ref => ref.orderBy('name', 'asc'));
    this.players = this.playersCollection.snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Player;
          const id = a.payload.doc.id;
          return {id, data};
        });
      });

    this.players.subscribe(player => {
      player.forEach(p => {
        if(!this.playersMap.has(p.id)){
          this.playersMap.set(p.id, {
            playername: p.data.name,
            hasScore: false
          });
        }
      })

      this.scoresCollection = this.firestore.collection('userscores', ref => ref.where('matchday', '==', this.globalVars.matchdayId));
      this.scores = this.scoresCollection.snapshotChanges()
        .map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data() as Score;
            const id = a.payload.doc.id;
            return {id, data};
          });
        });

      this.scores.subscribe(score=>{

        score.forEach(s=>{
          if (this.playersMap.has(s.data.player)) {
            this.playersMap.get(s.data.player).hasScore = true;
          }
        })

        player.forEach(p => {
          if (this.playersMap.has(p.id)) {
            console.log("found")
            p.hasScore = this.playersMap.get(p.id).hasScore;
          }
        })

      })
      this.players = Observable.of(player);
    })

    this.selectedMatchday = this.firestore.doc("gamedays/" + this.globalVars.matchdayId);
    this.matchday = this.selectedMatchday.valueChanges();
    this.matchday.subscribe(value => {
      this.matchday = value;
    });
  }

  insertPlayer(playerid){
    const pushkey = this.firestore.createId();
    this.firestore.collection("userscores").doc(pushkey).set({
      chips: 10,
      totalscore: 0,
      buyin: 10,
      player: playerid,
      matchday: this.globalVars.matchdayId,
      matchdayDate: this.matchday.date
    });

    this.selectedPlayer = this.playersMap.get(playerid).playername;
    this.globalVars.selectedScore = pushkey;
  }

}
