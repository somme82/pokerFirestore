import {Component, OnInit, ViewChild} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import {MatDatepicker, MatDatepickerInputEvent, MatDialog} from '@angular/material';
import {Player} from '../Player';
import {GlobalVars} from '../../GlobalVars';
import {UserDialogComponent} from './user-dialog/user-dialog.component';
import {Score} from '../Score';

@Component({
  selector: 'my-scoretable',
  templateUrl: './scoretable.component.html',
  styleUrls: ['./scoretable.component.css']
})
export class ScoretableComponent implements OnInit {


  playersCollection: AngularFirestoreCollection<Player>;
  players: any

  scoreCollection: AngularFirestoreCollection<Score>;
  scores: any;

  matchdayDate: Date;
  newMatchdayDoc: AngularFirestoreDocument<Score>;
  newMatchday: any;

  playerResults: Player[] = new Array<Player>();

  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;

  constructor(private firestore: AngularFirestore, public dialog: MatDialog, private globalVars: GlobalVars) { }

  ngOnInit( ) {
    this.getPlayerResults();
    this.playersCollection = this.firestore.collection('players');
    this.players = this.playersCollection.snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Player;
          const id = a.payload.doc.id;
          if (this.playerResults.some(p=>p.id == id))  {
            data.totalscore = this.playerResults.find(p => p.id === id).totalscore;
            data.totalbuyin = this.playerResults.find(p => p.id === id).totalbuyin;
          }

          return {id, data};
        }).sort(function(a, b){
          return b.data.totalscore-a.data.totalscore;
        });
      });
  }

  onDateChange = (e: MatDatepickerInputEvent<Date>) => {
    this.matchdayDate = e.value;
    const pushkey = this.firestore.createId();
    this.firestore.collection("matchdays").doc(pushkey).set({
      date: this.matchdayDate,
      venue: this.globalVars.selectedPlayer
    });
    this.newMatchdayDoc = this.firestore.doc('matchdays/' + pushkey);
    this.newMatchday = this.newMatchdayDoc.snapshotChanges();
    this.globalVars.matchdayId = pushkey;
  }

  openDatepicker()
  {
    this.datepicker.open();
  }

  setPlayer(name){
    this.globalVars.selectedPlayer = name;
  }


  getPlayerResults(){
    this.playerResults = new Array<Player>()
    this.scoreCollection = this.firestore.collection('scores');
    this.scores = this.scoreCollection.snapshotChanges()
      .map(actions => {
        return actions.map( a => {
          const data = a.payload.doc.data() as Score;
          const id = a.payload.doc.id;
          return {id, data};
        });
      });

    this.scores.subscribe( s => {
      this.scores = s;
      if (this.scores && this.scores.length > 0) {
        this.scores.forEach(s => {
          if (this.playerResults.some(p => p.id === s.data.player))
          {
            this.playerResults.find(p => p.id === s.data.player).totalscore += s.data.totalscore;
            this.playerResults.find(p => p.id === s.data.player).totalbuyin += s.data.buyin;
          } else {
            var player = <Player>{};
            player.id = s.data.player;
            player.totalscore = s.data.totalscore;
            player.totalbuyin = s.data.buyin;
            this.playerResults.push(player);
          }
        })
      }

      this.playerResults = this.playerResults.sort(function(a, b){
        return b.totalscore-a.totalscore;
      });
    });
  }

  openDialog() {
    this.dialog.open(UserDialogComponent, {
      panelClass: 'fnpc-dialog'
    });
  }

}
