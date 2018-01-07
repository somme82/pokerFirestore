import { Component, OnInit } from '@angular/core';
import {GlobalVars} from "../../GlobalVars";
import {Email} from "../Email";
import {Headers, Http, RequestOptions, Response} from '@angular/http';
import {Score} from "../Score";
import {AngularFirestore, AngularFirestoreCollection} from "angularfire2/firestore";
import {Player} from "../Player";
import {Matchday} from "../Matchday";
import {Article} from "../Article";




@Component({
  selector: 'my-server-tools',
  templateUrl: './server-tools.component.html',
  styleUrls: ['./server-tools.component.css']
})
export class ServerToolsComponent implements OnInit {

  playerCollection: AngularFirestoreCollection<Player>;
  player: any

  matchdayCollection: AngularFirestoreCollection<Matchday>;
  matchday: any

  scoreCollection: AngularFirestoreCollection<Score>;
  score: any

  articleCollection: AngularFirestoreCollection<Article>;
  article: any

  backup: Array<any> = new Array<any>();

  constructor(private globalVars: GlobalVars, private http: Http, private firestore: AngularFirestore) { }

  ngOnInit() {


  }

  doBackup(){
    var playerJson: string;

    this.playerCollection = this.firestore.collection('players', ref => ref
      .orderBy('name', 'asc')
    );
    this.player = this.playerCollection.snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Score;
          const id = a.payload.doc.id;
          return {id, data};
        });
      });
    this.player.subscribe(p=>{

      this.backup.push({
        players: p
      })

      this.matchdayCollection = this.firestore.collection('gamedays', ref => ref.orderBy('date', 'asc'));
      this.matchday = this.matchdayCollection.snapshotChanges()
        .map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data() as Score;
            const id = a.payload.doc.id;
            return {id, data};
          });
        });
      this.matchday.subscribe(m=>{
        this.backup.push({
          matchdays: m
        })

        this.scoreCollection = this.firestore.collection('userscores', ref=> ref.orderBy('matchdayDate', 'asc'));
        this.score = this.scoreCollection.snapshotChanges()
          .map(actions => {
            return actions.map(a => {
              const data = a.payload.doc.data() as Score;
              const id = a.payload.doc.id;
              return {id, data};
            });
          });
        this.score.subscribe(s=>{
          this.backup.push({
            scores: s
          })

          this.articleCollection = this.firestore.collection('matchdayarticles', ref=> ref.orderBy('matchdayDate', 'asc'));
          this.article = this.articleCollection.snapshotChanges()
            .map(actions => {
              return actions.map(a => {
                const data = a.payload.doc.data() as Score;
                const id = a.payload.doc.id;
                return {id, data};
              });
            });
          this.article.subscribe(a=>{
            this.backup.push({
              articles: a
            })


            var body = {
              text: JSON.stringify(this.backup)
            }

            var options: RequestOptions = new RequestOptions();
            options.headers = new Headers();
            options.headers.append('content-type', 'application/json');
            console.log('send to function');
            this.http
              .post('https://us-central1-friday-night-poker.cloudfunctions.net/sendMail', body, options).toPromise()
              .then(res => res)
              .catch(this.handleError)
          })
        });
      })
    })
  }


  doImport(){

    var matchdays = this.globalVars.matchdays;
    var user = this.globalVars.user;
    var scores = this.globalVars.scores;
    var articles = this.globalVars.articles;

    console.log('##### user #####');
    console.log(user);

    var existingPlayers: AngularFirestoreCollection<Player>;
    var players: any;
    var playersMap: Map<string, any> = new Map<string, any>();

    existingPlayers = this.firestore.collection('players');
    players = existingPlayers.snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Score;
          data.id = a.payload.doc.id;
          return {data};
        });
      });

    players.subscribe(player=>{
      player.forEach(p=>{
        if (!playersMap.has(p.data.name.toLowerCase())){
          playersMap.set(p.data.name.toLowerCase(), p.data);
        }
      })

      console.log('###### playersMap #####');
      console.log(playersMap);

      user.forEach(u=>{
        if (u.username.toLowerCase() == 'dominik')
        {
          u.username = 'Dome';
        }
        if (!playersMap.has(u.username.toLowerCase())){
          var pushkey = this.firestore.createId();
          this.firestore.collection('players').doc(pushkey).set({
            name: u.username,
          })

          var importedUser = new Player();
          importedUser.name = u.username;
          importedUser.id = pushkey;
          importedUser.imported = true;
          playersMap.set(u.username.toLowerCase(), importedUser)

        } else{
          console.log(u.username + ' bereits angelegt!')
        }
      })



      var matchdayMap: Map<string, any> = new Map<string, any> ();


      matchdays.forEach(m => {
        var pushkey = this.firestore.createId();
        var venue = '';

        if (m.venue == 'Tobias'){
          m.venue = 'Tobse'
        }
        if (m.venue == 'Dominik') {
          m.venue = 'Dome';
        }
        if (! playersMap.has(m.venue.toLowerCase())){
          //console.log(m);
        } else{
          venue = playersMap.get(m.venue.toLowerCase()).id;
        }

        var matchday = {
          data: {
            venue: venue,
            date: new Date(m.date),
          },
          id: pushkey
        }
        this.firestore.collection('gamedays').doc(pushkey).set(matchday.data);
        matchdayMap.set(m.id, matchday);
      })

      var scoresMap: Map<string, any> = new Map<string, any>();


      scores.sort(function (a, b) {
        return a.id - b.id;
      }).forEach(score => {

        if (scoresMap.has(score.matchday_id)){

          if (score.user_name.toLowerCase() == 'dominik'){
            score.user_name = 'Dome';
          }
          //console.log(score.user_name.toLowerCase())

          //if (scoresMap.get(score.matchday_id).some(p=>p.username == playersMap.get(score.user_name.toLowerCase()).id)){
          if (scoresMap.get(score.matchday_id).some(p=>p.username == score.user_name)){
            if (score.isRebuy == '1') {
              //scoresMap.get(score.matchday_id).find(p=>p.username == playersMap.get(score.user_name.toLowerCase()).id).buyIn =
              //  Number(scoresMap.get(score.matchday_id).find(p=>p.username == playersMap.get(score.user_name.toLowerCase()).id).buyIn) + Number(score.buyIn);
              scoresMap.get(score.matchday_id).find(p=>p.username == score.user_name).buyIn =
                Number(Number(scoresMap.get(score.matchday_id).find(p=>p.username ==score.user_name).buyIn) + Number(score.chipcount));

            }else{
              //scoresMap.get(score.matchday_id).find(p=>p.username == playersMap.get(score.user_name.toLowerCase()).id).chips = Number(score.chips);
              scoresMap.get(score.matchday_id).find(p=>p.username == score.user_name).chips = Number(score.chipcount);
              scoresMap.get(score.matchday_id).find(p=>p.username == score.user_name).totalscore = Number(Number(score.chipcount) - scoresMap.get(score.matchday_id).find(p=>p.username == score.user_name).buyIn)
            }
          }else {
            scoresMap.get(score.matchday_id).push({
              //username: playersMap.get(score.user_name.toLowerCase()).id,
              username: score.user_name,
              chips: Number(score.chipcount),
              buyIn: Number(score.chipcount),
              totalscore: 0,
              rebuy: score.isRebuy
            });
          }
        } else {
          var users = new Array<any>();
          users.push({
            //username: playersMap.get(score.user_name.toLowerCase()).id,
            username: score.user_name,
            chips: Number(score.chipcount),
            buyIn: Number(score.chipcount),
            totalscore: 0,
            rebuy: score.isRebuy
          })
          scoresMap.set(score.matchday_id, users);
        }
      })

      scoresMap.forEach(sc=>{
        sc.sort(function (a, b) {
          return b.totalscore - a.totalscore;
        })
      })

      var finalScoreMap: Map<string, any> = new Map<string, any>();
      scoresMap.forEach((sc, key)=>{
        finalScoreMap.set(key, new Array<any>());
        sc.forEach(userScore=>{

          var score = {
            player: playersMap.get(userScore.username.toLowerCase()).id,
            chips: Number(userScore.chips),
            buyin: Number(userScore.buyIn),
            totalscore: Number(userScore.totalscore),
            matchdayDate: new Date(matchdayMap.get(key).data.date),
            matchday: matchdayMap.get(key).id
          }
          finalScoreMap.get(key).push(score);
          this.firestore.collection('userscores').add(score);
        })
      })

      articles.forEach(a=>{

        var article: any = {
          text: a.text,
          matchdayDate: new Date(matchdayMap.get(a.matchday_id).data.date),
          matchdayVenue: playersMap.get(a.user_name.toLowerCase()).id,
          matchdayId: this.globalVars.matchdayId,
          player: matchdayMap.get(a.matchday_id).id
        };

        this.firestore.collection('matchdayarticles').add(article)
      })



      console.log('##### scoresMap #####')
      console.log(scoresMap);
      console.log('##### matchdayMap #####')
      console.log(matchdayMap);
    })
  }


  doImportFirestoreData(){

    var firestore_data = this.globalVars.firestore_data;

    console.log(firestore_data)

    firestore_data[0].players.forEach(player=>{
      console.log(player)
      this.firestore.collection('players').doc(player.id).set(player.data);
    })

    firestore_data[1].matchdays.forEach(matchday=>{
      var gameday: any = {
        date: new Date(matchday.data.date),
        venue: matchday.data.venue
      }
      this.firestore.collection('gamedays').doc(matchday.id).set(gameday);
    })

    firestore_data[2].scores.forEach(score=>{
      var newScore: any = {
        buyin: Number(score.data.buyin),
        chips: Number(score.data.chips),
        matchday: score.data.matchday,
        matchdayDate: new Date(score.data.matchdayDate),
        player: score.data.player,
        totalscore: Number(score.data.totalscore)
      }
      this.firestore.collection('userscores').doc(score.id).set(newScore);
    })

    firestore_data[3].articles.forEach(article=>{
      this.firestore.collection('matchdayarticles').doc(article.id).set(article.data);
    })

  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }



}
