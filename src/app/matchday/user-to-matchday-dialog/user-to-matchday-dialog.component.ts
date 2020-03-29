import { Component, OnInit } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from '@angular/fire/firestore';
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

  playersAsArray: any;
  selectedPlayer: string;
  playersMap: Map<string, any> = new Map<string, any>()
  playersToAdd: Array<string> = new Array<string>();

  constructor(private firestore: AngularFirestore, public globalVars: GlobalVars) { }

  ngOnInit() {
    this.playersCollection = this.firestore.collection('players', ref => ref.orderBy('name', 'asc'));
    this.players = this.playersCollection.snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Player;
          var avatar = "empty.jpg"
          if (data.avatar != undefined){
            avatar = data.avatar;
          }
          const id = a.payload.doc.id;
          return {id, avatar, data};
        });
      });

    this.players.subscribe(player => {
      this.playersAsArray = player;

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
        this.scores = score
        score.forEach(s=>{
          if (this.playersAsArray.some(p=>p.id == s.data.player)) {
            this.playersAsArray.find(p=>p.id == s.data.player).hasScore = true;
            this.playersAsArray.find(p=>p.id == s.data.player).markForScore = true;
            this.playersAsArray.find(p=>p.id == s.data.player).scoreId = s.id;
          }
        })
      })
      console.log(this.playersAsArray)
      this.players = Observable.of(this.playersAsArray);
    })
    this.selectedMatchday = this.firestore.doc("gamedays/" + this.globalVars.matchdayId);
    this.matchday = this.selectedMatchday.valueChanges();
    this.matchday.subscribe(value => {
      this.matchday = value;
    });
  }

  insertPlayerToMatchday(){
    this.playersAsArray.filter(p=>(p.markForScore && !p.hasScore)).forEach(p=>{
      const pushkey = this.firestore.createId();
      this.firestore.collection("userscores").doc(pushkey).set({
        chips: 10,
        totalscore: 0,
        buyin: 10,
        player: p.id,
        matchday: this.globalVars.matchdayId,
        matchdayDate: this.matchday.date
      });
      this.globalVars.selectedPlayer = p.id;
      this.globalVars.selectedScore = pushkey;
    })


    this.playersAsArray.filter(p=>(!p.markForScore && p.hasScore)).forEach(p=>{
      if (p.scoreId != ''){
        this.firestore.doc("userscores/" + p.scoreId).delete();
      }
    })
    console.log(this.globalVars.currentMatchdayResults)
    this.globalVars.setGlobalVariables();
    this.globalVars.closeAllDialogs()
  }

  markPlayer(playerid){

    this.playersAsArray.find(p=>p.id == playerid).markForScore = !this.playersAsArray.find(p=>p.id == playerid).markForScore;
    this.players = Observable.of(this.playersAsArray)

    const pushkey = this.firestore.createId();
    /*this.firestore.collection("userscores").doc(pushkey).set({
      chips: 10,
      totalscore: 0,
      buyin: 10,
      player: playerid,
      matchday: this.globalVars.matchdayId,
      matchdayDate: this.matchday.date
    });*/
  }

}
