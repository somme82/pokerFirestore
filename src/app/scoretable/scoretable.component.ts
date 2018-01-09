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
  results: any;
  resultsByYear: any;

  showOverAllScoreTable = false;


  playerResults: Player[] = new Array<Player>();

  matchdayCount: number = 0
  matchdaysByYear: Map<number, Array<Matchday>> = new Map<number, Array<Matchday>>()


  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;

  constructor(private firestore: AngularFirestore, public dialog: MatDialog, public globalVars: GlobalVars, public serverTools: ServerToolsComponent) {
  }

  ngOnInit() {
    this.getPlayerResults();
  }

  getPlayerResults() {


    var playersMap: Map<string, string> = new Map<string, string>();
    this.playersCollection = this.firestore.collection('players');
    this.players = this.playersCollection.snapshotChanges()
      .map(actions => {
        return actions.map((a) => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return {id, data};
        })
      });

    this.players.subscribe( pl =>{
      this.players = pl;
      if(pl && pl.length > 0){
        pl.forEach(p=>{

          if(!playersMap.has(p.id)){
            playersMap.set(p.id, p.data.name)
          }
        })
      }

      this.matchdayCollection = this.firestore.collection('gamedays');
      this.matchdays = this.matchdayCollection.valueChanges();
      this.matchdays.subscribe( m => {
        this.matchdaysByYear = new Map<number, Array<Matchday>>();
        console.log('====> Gamedays changed')
        m.forEach(md=>{
          if (this.matchdaysByYear.has(Number(new Date(md.date).getFullYear()))){
            this.matchdaysByYear.get(Number(new Date(md.date).getFullYear())).push(md);
          } else{
            var newMd = new Array<Matchday>();
            newMd.push(md);
            this.matchdaysByYear.set(new Date(md.date).getFullYear(), newMd)
          }
        })


        this.playerResults = new Array<Player>()
        this.scoreCollection = this.firestore.collection('userscores', ref => ref
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
          console.log('====> Scores changed!')
          this.scores = s;
          var playerResultsByYear: Map<number, Player[]> = new Map<number, Player[]>();

          if (this.scores && this.scores.length > 0) {
            this.scores.forEach(s => {
              if (!playerResultsByYear.has(new Date(s.data.matchdayDate).getFullYear())){
                var player = <Player>{};
                if(playersMap.has(s.data.player)){
                  player.name = playersMap.get(s.data.player);
                }else{
                  player.name = '?';
                }

                player.id = s.data.player;
                player.totalscore = s.data.totalscore;
                player.totalbuyin = s.data.buyin;
                player.participations = 1;
                if(player.participations >= (this.matchdaysByYear.get(new Date(s.data.matchdayDate).getFullYear()).length / 3)){
                  player.relevantForTotalScore = true;
                }
                player.realRank = 1;
                player.overAllRank = 1;
                var players = new Array<Player>();
                players.push(player);

                playerResultsByYear.set(new Date(s.data.matchdayDate).getFullYear(), players);
              } else{
                if (playerResultsByYear.get(new Date(s.data.matchdayDate).getFullYear()).some(p => p.id === s.data.player)) {
                  var p = playerResultsByYear.get(new Date(s.data.matchdayDate).getFullYear()).find(p => p.id === s.data.player);
                  playerResultsByYear.get(new Date(s.data.matchdayDate).getFullYear()).find(p => p.id === s.data.player).totalscore = Number((Number(p.totalscore) + Number(s.data.totalscore)));
                  playerResultsByYear.get(new Date(s.data.matchdayDate).getFullYear()).find(p => p.id === s.data.player).totalbuyin = Number((Number(p.totalbuyin) + Number(s.data.buyin)));
                  playerResultsByYear.get(new Date(s.data.matchdayDate).getFullYear()).find(p => p.id === s.data.player).participations += 1;
                  if(playerResultsByYear.get(new Date(s.data.matchdayDate).getFullYear()).find(p => p.id === s.data.player).participations >= (this.matchdaysByYear.get(new Date(s.data.matchdayDate).getFullYear()).length / 3)){
                    playerResultsByYear.get(new Date(s.data.matchdayDate).getFullYear()).find(p => p.id === s.data.player).relevantForTotalScore = true;
                  }
                } else {
                  var player = <Player>{};
                  if(playersMap.has(s.data.player)){
                    player.name = playersMap.get(s.data.player);
                  }else{
                    player.name = '?';
                  }
                  player.id = s.data.player;
                  player.totalscore = s.data.totalscore;
                  player.totalbuyin = s.data.buyin;
                  player.participations = 1;
                  player.realRank = 1;
                  player.overAllRank = 1;
                  if(player.participations >= (this.matchdaysByYear.get(new Date(s.data.matchdayDate).getFullYear()).length / 3)){
                    player.relevantForTotalScore = true;
                  }
                  playerResultsByYear.get(new Date(s.data.matchdayDate).getFullYear()).push(player);
                }
              }
            })
          }
          playerResultsByYear.set(999, new Array<Player>())
          playerResultsByYear.forEach((year, key)=>{
            year.sort(function (a, b) {
              return b.totalscore - a.totalscore;
            });
            var realRank: number = 1;
            var overAllRank: number = 1;

            year.forEach(user=>{
              if(user.relevantForTotalScore){
                user.realRank = realRank;
                realRank ++;
              }
              user.overAllRank = overAllRank;
              overAllRank ++;
              this.imageExists(user);

              if (key != 999){
                if(playerResultsByYear.get(999).some(p=>p.id == user.id)){
                  playerResultsByYear.get(999).find(p=>p.id==user.id).totalscore = playerResultsByYear.get(999).find(p=>p.id==user.id).totalscore + user.totalscore,
                    playerResultsByYear.get(999).find(p=>p.id==user.id).totalbuyin = playerResultsByYear.get(999).find(p=>p.id==user.id).totalbuyin + user.totalbuyin
                  playerResultsByYear.get(999).find(p=>p.id==user.id).participations = playerResultsByYear.get(999).find(p=>p.id==user.id).participations + 1
                  playerResultsByYear.get(999).find(p=>p.id==user.id).overAllRank =  playerResultsByYear.get(999).find(p=>p.id==user.id).overAllRank + 1
                }else{
                  var newUser = <Player>{};
                  newUser.name = user.name;
                  newUser.id = user.id;
                  newUser.totalscore = user.totalscore;
                  newUser.totalbuyin = user.totalbuyin;
                  newUser.participations = 1;
                  newUser.overAllRank = 0;
                  newUser.relevantForTotalScore = true;
                  playerResultsByYear.get(999).push(newUser)
                }
              }

            })
          })
          playerResultsByYear.get(999).sort(function (a, b) {
            return b.totalscore - a.totalscore;
          });
          console.log(playerResultsByYear)

          console.log('set results by year')
          this.resultsByYear = playerResultsByYear;
          this.matchdayCount = this.matchdaysByYear.get(this.globalVars.currentYear).length;
          console.log(this.matchdaysByYear.get(this.globalVars.currentYear));
          if (this.globalVars.selectedPlayer == '' && playerResultsByYear.get(this.globalVars.currentYear).length > 0) {
            this.globalVars.selectedPlayer = playerResultsByYear.get(this.globalVars.currentYear)[0].id;
          }
          this.results = Observable.of(playerResultsByYear.get(this.globalVars.currentYear));
        });
      })


    });
  }

  onDateChange = (e: MatDatepickerInputEvent<Date>) => {

    this.matchdayDate = e.value;
    const pushkey = this.firestore.createId();
    var matchday = {
      date: this.matchdayDate,
      venue: this.globalVars.selectedPlayer
    }

    this.firestore.collection("gamedays").doc(pushkey).set(matchday);

    if ((this.matchdaysByYear.get(this.globalVars.currentYear).length + 1) % 4 == 0){
      this.serverTools.doBackup();
    }

    this.newMatchdayDoc = this.firestore.doc('gamedays/' + pushkey);
    this.newMatchday = this.newMatchdayDoc.snapshotChanges();
    this.globalVars.matchdayId = pushkey;
  }


  previousYear()
  {
    this.showOverAllScoreTable = false;
    if (this.matchdaysByYear.has(this.globalVars.currentYear - 1)){
      this.globalVars.currentYear--;
      this.results = Observable.of(this.resultsByYear.get(this.globalVars.currentYear))
      this.matchdayCount = this.matchdaysByYear.get(this.globalVars.currentYear).length
    }
  }

  nextYear()
  {
    if (this.matchdaysByYear.has(this.globalVars.currentYear + 1)) {
      this.globalVars.currentYear++;
      this.results = Observable.of(this.resultsByYear.get(this.globalVars.currentYear))
      this.matchdayCount = this.matchdaysByYear.get(this.globalVars.currentYear).length
    } else{
      this.showOverAllScoreTable = true;
      this.results = Observable.of(this.resultsByYear.get(999))
      console.log(this.resultsByYear.size - 1);
      this.matchdayCount = this.resultsByYear.size - 1;
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
    image.src = "../../assets/avatar/" + player.name.toLowerCase() + ".jpg";
  }

  openUserDialog() {
    this.dialog.open(UserDialogComponent, {
      panelClass: 'fnpc-dialog'
    });
  }

  openPlayerInfoDialog(){
    this.dialog.open(PlayerInfoDialogComponent, {
      panelClass: 'fnpc-dialog'
    });
  }

  openDatepicker() {
    this.datepicker.open();
  }
}
