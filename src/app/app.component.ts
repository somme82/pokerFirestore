import {Component, OnInit} from '@angular/core';
import {Player} from "./Player";
import {Observable} from "rxjs/Observable";
import {Matchday} from "./Matchday";
import {Score} from "./Score";
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from "@angular/fire/firestore";
import {ServerToolsComponent} from "./server-tools/server-tools.component";
import {MatDialog} from "@angular/material";
import {GlobalVars} from "../GlobalVars";
import 'rxjs/add/operator/map';

@Component({
  selector: 'my-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  playersCollection: AngularFirestoreCollection<Player>;
  players: any

  scoreCollection: AngularFirestoreCollection<Score>;
  scores: any;

  matchdayCollection: AngularFirestoreCollection<Matchday>;
  matchdays: any;

  matchdayDate: Date;
  results: any;

  constructor(private firestore: AngularFirestore, public dialog: MatDialog, public globalVars: GlobalVars, public serverTools: ServerToolsComponent) {}

  ngOnInit(): void {
    console.log('app.component.ts')
    this.getPlayerResults()
  }

  getPlayerResults() {

    this.playersCollection = this.firestore.collection('players');
    this.players = this.playersCollection.snapshotChanges()
      .map(actions => {
        return actions.map((a) => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          if(!this.globalVars.playersMap.has(id)){
            this.globalVars.playersMap.set(id, {
              id: id,
              data: data
            })
          }
          return {id, data};
        })
      });

    this.players.subscribe( pl =>{
      this.players = pl;
      this.matchdayCollection = this.firestore.collection('gamedays', ref=>ref.orderBy('date', 'asc'));
      this.matchdays = this.matchdayCollection.snapshotChanges()
        .map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data();

            data.playerName = this.globalVars.getPlayerNameById(data.venue)

            const id = a.payload.doc.id;
            var results = new Array<any>();
            return {id, results, data};
          });
        });
      this.matchdays.subscribe( m => {
        this.globalVars.matchdaysByYear = new Map<number, Array<Matchday>>();
        m.forEach(md=>{
          if (!this.globalVars.matchdaysMap.has(md.id)){
            this.globalVars.matchdaysMap.set(md.id, md)
          }
          if (this.globalVars.matchdaysByYear.has(Number(new Date(md.data.date).getFullYear()))){
            this.globalVars.matchdaysByYear.get(Number(new Date(md.data.date).getFullYear())).push(md);
          } else{
            var newMd = new Array<Matchday>();
            newMd.push(md);
            this.globalVars.matchdaysByYear.set(Number(new Date(md.data.date).getFullYear()), newMd)
          }
        })
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
          console.log('scores changed!')
          this.scores = s;
          var playerResultsByYear: Map<number, Player[]> = new Map<number, Player[]>();

          if (this.scores && this.scores.length > 0) {
            var scoreBefore = this.scores[0];
            if (this.globalVars.matchdaysByYear.get(new Date(scoreBefore.data.matchdayDate).getFullYear()).some(m=>m.id == scoreBefore.data.matchday))
            {
              this.globalVars.matchdaysByYear.get(new Date(scoreBefore.data.matchdayDate).getFullYear()).find(m=>m.id == scoreBefore.data.matchday).results = new Array<any>();
            }
            this.scores.forEach(s => {



              if (s.data.matchday != scoreBefore.data.matchday)
              {
                if (this.globalVars.matchdaysByYear.get(new Date(s.data.matchdayDate).getFullYear()).some(m=>m.id == s.data.matchday))
                {
                  this.globalVars.matchdaysByYear.get(new Date(s.data.matchdayDate).getFullYear()).find(m=>m.id == s.data.matchday).results = new Array<any>();
                }

                this.globalVars.matchdaysByYear.get(new Date(scoreBefore.data.matchdayDate).getFullYear()).find(m=>m.id == scoreBefore.data.matchday).results =
                  this.globalVars.matchdaysByYear.get(new Date(scoreBefore.data.matchdayDate).getFullYear()).find(m=>m.id == scoreBefore.data.matchday).results.sort(function (a, b) {
                  return b.data.totalscore - a.data.totalscore;
                });
              }
              scoreBefore= s;
              s.playername = this.globalVars.getPlayerNameById(s.data.player)
              s.avatar = this.globalVars.getPlayerAvatarById(s.data.player)
              this.globalVars.matchdaysByYear.get(new Date(s.data.matchdayDate).getFullYear()).find(m=>m.id == s.data.matchday).results.push(s);

              if (!playerResultsByYear.has(new Date(s.data.matchdayDate).getFullYear())){
                var player = <Player>{};
                player.name = this.globalVars.getPlayerNameById(s.data.player)
                player.avatar = this.globalVars.getPlayerAvatarById(s.data.player)
                player.id = s.data.player;
                player.totalscore = s.data.totalscore;
                player.totalbuyin = s.data.buyin;
                player.participations = 1;
                if(player.participations >= (this.globalVars.matchdaysByYear.get(new Date(s.data.matchdayDate).getFullYear()).length / 3)){
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
                  if(playerResultsByYear.get(new Date(s.data.matchdayDate).getFullYear()).find(p => p.id === s.data.player).participations >= (this.globalVars.matchdaysByYear.get(new Date(s.data.matchdayDate).getFullYear()).length / 3)){
                    playerResultsByYear.get(new Date(s.data.matchdayDate).getFullYear()).find(p => p.id === s.data.player).relevantForTotalScore = true;
                  }
                } else {
                  var player = <Player>{};
                  player.name = this.globalVars.getPlayerNameById(s.data.player)
                  player.avatar = this.globalVars.getPlayerAvatarById(s.data.player)
                  player.id = s.data.player;
                  player.totalscore = s.data.totalscore;
                  player.totalbuyin = s.data.buyin;
                  player.participations = 1;
                  player.realRank = 1;
                  player.overAllRank = 1;
                  if(player.participations >= (this.globalVars.matchdaysByYear.get(new Date(s.data.matchdayDate).getFullYear()).length / 3)){
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
              if (key != 999){
                if(playerResultsByYear.get(999).some(p=>p.id == user.id)){
                  playerResultsByYear.get(999).find(p=>p.id==user.id).totalscore = playerResultsByYear.get(999).find(p=>p.id==user.id).totalscore + user.totalscore,
                    playerResultsByYear.get(999).find(p=>p.id==user.id).totalbuyin = playerResultsByYear.get(999).find(p=>p.id==user.id).totalbuyin + user.totalbuyin
                  playerResultsByYear.get(999).find(p=>p.id==user.id).participations = playerResultsByYear.get(999).find(p=>p.id==user.id).participations + 1
                  playerResultsByYear.get(999).find(p=>p.id==user.id).overAllRank =  playerResultsByYear.get(999).find(p=>p.id==user.id).overAllRank + 1
                }else{
                  var newUser = <Player>{};
                  newUser.name = user.name;
                  newUser.avatar = user.avatar;
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
          this.globalVars.matchdayResultsByYear = playerResultsByYear;

          if (!this.globalVars.matchdaysByYear.has(this.globalVars.currentYear)){
            this.globalVars.currentYear = this.globalVars.currentYear -1;
          }
        
          this.globalVars.matchdayCount = this.globalVars.matchdaysByYear.get(this.globalVars.currentYear).length;
          if (this.globalVars.selectedPlayer == '' && playerResultsByYear.get(this.globalVars.currentYear).length > 0) {
            this.globalVars.selectedPlayer = playerResultsByYear.get(this.globalVars.currentYear)[0].id;
          }
          this.globalVars.matchdayResultsObservable = Observable.of(playerResultsByYear.get(this.globalVars.currentYear));

          this.globalVars.setGlobalVariables()

        });


      })


    });
  }
}
