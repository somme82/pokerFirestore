import {Component, OnInit, ViewChild} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import {MatDatepicker, MatDatepickerInputEvent, MatDialog} from '@angular/material';
import {Player} from '../Player';
import {GlobalVars} from '../../GlobalVars';
import {UserDialogComponent} from './user-dialog/user-dialog.component';
import {Score} from '../Score';
import {Matchday} from '../Matchday';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import {PlayerInfoDialogComponent} from './player-info-dialog/player-info-dialog.component';
import {ServerToolsComponent} from "../server-tools/server-tools.component";

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

  matchdayCollection: AngularFirestoreCollection<Matchday>;
  matchdays: any;

  matchdayDate: Date;
  newMatchdayDoc: AngularFirestoreDocument<Score>;
  newMatchday: any;

  playerResults: Player[] = new Array<Player>();

  matchdayCount: number = 0


  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;

  constructor(private firestore: AngularFirestore, public dialog: MatDialog, public globalVars: GlobalVars, public serverTools: ServerToolsComponent) {
  }

  ngOnInit() {
    this.getPlayerResults();
  }

  onDateChange = (e: MatDatepickerInputEvent<Date>) => {

    this.matchdayDate = e.value;
    const pushkey = this.firestore.createId();
    var matchday = {
      date: this.matchdayDate,
      venue: this.globalVars.selectedPlayer
    }

    this.firestore.collection("gamedays").doc(pushkey).set(matchday);

    if ((this.matchdayCount + 1) % 4 == 0){
      this.serverTools.doBackup();
    }

    this.newMatchdayDoc = this.firestore.doc('gamedays/' + pushkey);
    this.newMatchday = this.newMatchdayDoc.snapshotChanges();
    this.globalVars.matchdayId = pushkey;
  }

  openDatepicker() {
    this.datepicker.open();
  }

  setPlayer(name) {
    this.globalVars.selectedPlayer = name;
  }


  getPlayerResults() {
    let start = new Date(this.globalVars.currentYear + '-01-01');
    let end = new Date(this.globalVars.currentYear + '-12-31');

    this.matchdayCollection = this.firestore.collection('gamedays', ref => ref
      .where('date', '>=', start)
      .where('date', '<=', end));

    this.matchdays = this.matchdayCollection.valueChanges();
    this.matchdays.subscribe( m => {
      this.matchdayCount = m.length;
      
      this.playerResults = new Array<Player>()
      this.scoreCollection = this.firestore.collection('userscores', ref => ref
        .where('matchdayDate', '>=', start)
        .where('matchdayDate', '<=', end)
        .orderBy('matchdayDate', 'asc')
      );
      this.scores = this.scoreCollection.snapshotChanges()
        .map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data() as Score;
            const id = a.payload.doc.id;
            return {id, data};
          });
        });

      this.scores.subscribe(s => {
        this.scores = s;


        if (this.scores && this.scores.length > 0) {
          this.scores.forEach(s => {
            if (this.playerResults.some(p => p.id === s.data.player)) {
              var p = this.playerResults.find(p => p.id === s.data.player);
              this.playerResults.find(p => p.id === s.data.player).totalscore = Number((Number(p.totalscore) + Number(s.data.totalscore)));
              this.playerResults.find(p => p.id === s.data.player).totalbuyin = Number((Number(p.totalbuyin) + Number(s.data.buyin)));
              this.playerResults.find(p => p.id === s.data.player).participations += 1;
            } else {
              var player = <Player>{};
              player.id = s.data.player;
              player.totalscore = s.data.totalscore;
              player.totalbuyin = s.data.buyin;
              player.participations = 1;
              this.playerResults.push(player);
            }
          })
        }

        this.playerResults = this.playerResults.sort(function (a, b) {
          return b.totalscore - a.totalscore;
        });

        this.playersCollection = this.firestore.collection('players');
        this.players = this.playersCollection.snapshotChanges()
          .map(actions => {
            return actions.map((a, index) => {
              const data = a.payload.doc.data() as Player;
              const id = a.payload.doc.id;
              if (this.playerResults.some(p => p.id == id)) {
                var player = this.playerResults.find(p => p.id === id);
                data.totalscore = player.totalscore;
                data.totalbuyin = player.totalbuyin;
                data.participations = player.participations;
                data.relevantForTotalScore = false;
              } else{
                data.participations = 0;
              }
              return {id, data};
            }).filter(p => p.data.participations > 0).sort(function (a, b) {
              return b.data.totalscore - a.data.totalscore;
            })
          });

        var realRank: number = 1;
        var overAllRank: number = 1;
        this.players.subscribe(player=>{
          player.forEach(p=>{
            if(p.data.participations >= (this.matchdayCount / 3)){
              p.data.relevantForTotalScore = true;
              p.data.realRank = realRank;
              realRank ++;
            }
            p.data.overAllRank = Number(overAllRank)
            overAllRank ++
            this.imageExists(p);
          })
          if (this.globalVars.selectedPlayer == '' && player.length > 0) {
            this.globalVars.selectedPlayer = player[0].id;
          }
          this.players = Observable.of(player);
        });
      });
    })
  }

  openDialog() {
    this.dialog.open(UserDialogComponent, {
      panelClass: 'fnpc-dialog'
    });
  }

  openPlayerInfoDialog(){
    this.dialog.open(PlayerInfoDialogComponent, {
      panelClass: 'fnpc-dialog'
    });
  }

  previousYear()
  {
    this.globalVars.currentYear--;
    this.getPlayerResults();
  }

  nextYear()
  {
    this.globalVars.currentYear++;
    this.getPlayerResults();
  }
  showAllPlayers()
  {
    if(this.globalVars.showAllPlayers){
      this.globalVars.showAllPlayers = false;
    } else{
      this.globalVars.showAllPlayers = true;
    }
  }

  imageExists(player) {
    var image = new Image();
    image.onload = function(){
      player.hasImage = true;
    };
    image.onerror = function(){
      player.hasImage = false;
    };
    image.src = "../../assets/avatar/" + player.data.name.toLowerCase() + ".jpg";
  }

}
