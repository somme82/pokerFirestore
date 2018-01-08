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

  playersMap: Map<string, any> = new Map<string, any>();
  matchdayMap: Map<string, any> = new Map<string, any> ();
  scoresMap: Map<string, any> = new Map<string, any> ();
  articlesMap: Map<string, any> = new Map<string, any> ();

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
              .post('https://us-central1-friday-night-poker-crew.cloudfunctions.net/sendMail', body, options).toPromise()
              .then(res => res)
              .catch(this.handleError)
          })
        });
      }) 
    })
  }

  setPlayersMap(){
    var user = this.globalVars.user;

    var existingPlayers: AngularFirestoreCollection<Player>;
    var players: any;
    var count = 0;


    existingPlayers = this.firestore.collection('players');
    players = existingPlayers.snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data ={
              data: a.payload.doc.data() as Score,
              id: a.payload.doc.id
          }
          return {data};
        });
      });

    players.subscribe(player=>{
      player.forEach(p=>{
        if (!this.playersMap.has(p.data.data.name.toLowerCase())){
          this.playersMap.set(p.data.data.name.toLowerCase(), p.data);
        }
      })

      user.forEach(u=>{
        if (u.username.toLowerCase() == 'dominik')
        {
          u.username = 'Dome';
        }

        if (u.username.toLowerCase() == 'siggi')
        {
          u.username = 'Sigi';
        }
        if (u.username.toLowerCase() == 'tobias')
        {
          u.username = 'Tobse';
        }

        if (!this.playersMap.has(u.username.toLowerCase())){
          var pushkey = this.firestore.createId();
          var importedUser = {
            data: {
              name: u.username,
              imported: true
            },
            id: pushkey
          }
          this.playersMap.set(u.username.toLowerCase(), importedUser)
          count ++;

        } else{

        }
      })
    })


    console.log('###### playersMap #####');
    console.log('Neu anzulegen: ' + count);
    console.log(this.playersMap);
  }


  setMatchdaysMap(){
    var matchdays = this.globalVars.matchdays;
    var count = 0;

    matchdays.filter(md=> new Date(md.date) > new Date("2013-01-01")).forEach(m => {
      var pushkey = this.firestore.createId();
      var venue = '';

      if (m.venue == 'Tobias'){
        m.venue = 'Tobse'
      }
      if (m.venue == 'Dominik') {
        m.venue = 'Dome';
      }

      if (m.venue == 'Siggi') {
        m.venue = 'Sigi';
      }
      if (!this.playersMap.has(m.venue.toLowerCase())){

      } else{
        venue = this.playersMap.get(m.venue.toLowerCase()).id;
      }

      var matchday = {
        data: {
          venue: venue,
          date: new Date(m.date),
        },
        id: pushkey
      }
      count ++;
      this.matchdayMap.set(m.id, matchday);
    })

    console.log('###### matchdayMap #####');
    console.log('Neu anzulegen: ' + count);
    console.log(this.matchdayMap);
  }

  setScoresMap(){
    var scores = this.globalVars.scores;
    var count = 0;

    scores.sort(function (a, b) {
      return a.id - b.id;
    }).forEach(score => {

      if (this.scoresMap.has(score.matchday_id)){

        if (score.user_name.toLowerCase() == 'dominik'){
          score.user_name = 'Dome';
        }

        if (score.user_name.toLowerCase() == 'siggi'){
          score.user_name = 'Sigi';
        }

        if (this.scoresMap.get(score.matchday_id).some(p=>p.username == score.user_name)){
          if (score.isRebuy == '1') {
            this.scoresMap.get(score.matchday_id).find(p=>p.username == score.user_name).buyIn =
              Number(Number(this.scoresMap.get(score.matchday_id).find(p=>p.username ==score.user_name).buyIn) + Number(score.chipcount));
          }else{
            this.scoresMap.get(score.matchday_id).find(p=>p.username == score.user_name).chips = Number(score.chipcount);
            this.scoresMap.get(score.matchday_id).find(p=>p.username == score.user_name).totalscore = Number(Number(score.chipcount) - this.scoresMap.get(score.matchday_id).find(p=>p.username == score.user_name).buyIn)
          }
        }else {
          this.scoresMap.get(score.matchday_id).push({
            username: score.user_name,
            chips: Number(score.chipcount),
            buyIn: Number(score.chipcount),
            totalscore: 0,
            rebuy: score.isRebuy
          });
          count ++;
        }
      } else {
        var users = new Array<any>();
        users.push({
          username: score.user_name,
          chips: Number(score.chipcount),
          buyIn: Number(score.chipcount),
          totalscore: 0,
          rebuy: score.isRebuy
        })
        count ++;
        this.scoresMap.set(score.matchday_id, users);
      }
    })

    this.scoresMap.forEach(sc=>{
      sc.sort(function (a, b) {
        return b.totalscore - a.totalscore;
      })
    })

    var finalScoreMap: Map<string, any> = new Map<string, any>();
    this.scoresMap.forEach((sc, key)=>{
      finalScoreMap.set(key, new Array<any>());
      sc.forEach(userScore=>{
        if (this.matchdayMap.has(key)){
          console.log(userScore.username)
          var score = {
            player: this.playersMap.get(userScore.username.toLowerCase()).id,
            chips: Number(userScore.chips),
            buyin: Number(userScore.buyIn),
            totalscore: Number(userScore.totalscore),
            matchdayDate: new Date(this.matchdayMap.get(key).data.date),
            matchday: this.matchdayMap.get(key).id
          }
          finalScoreMap.get(key).push(score);
        }
      })
      this.scoresMap = finalScoreMap;
    })
    console.log('###### scoresMap #####');
    console.log('Neu anzulegen: ' + count);
    console.log(this.scoresMap)
  }

  setArticlesMap(){
    var articles = this.globalVars.articles;
    var count = 0;
    articles.forEach(a=>{
      var article: any = {
        text: a.text,
        matchdayDate: new Date(this.matchdayMap.get(a.matchday_id).data.date),
        matchdayVenue: this.playersMap.get(a.user_name.toLowerCase()).id,
        matchdayId: this.globalVars.matchdayId,
        player: this.matchdayMap.get(a.matchday_id).id
      };
      this.articlesMap.set(this.globalVars.matchdayId, article);
      count ++
    })
    console.log('###### articlesMap #####');
    console.log('Neu anzulegen: ' + count);
    console.log(this.articlesMap)
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

  importPlayers(){
    this.playersMap.forEach(p=>{
      console.log('trying to import player with id ' + p.id + '(' + p.data.name + ')');
      console.log(p.data);
      this.firestore.collection('players').doc(p.id).set(p.data);
      //this.firestore.collection('players', p.data.data);
    })
  }

  importMatchdays(){
    this.matchdayMap.forEach(md=>{
      console.log('trying to import matchday with id ' + md.id)
      this.firestore.collection('gamedays').doc(md.id).set(md.data);
      console.log(md.data);
    })
  }

  importScores(){
    var count = 0;
    console.log()
    this.scoresMap.forEach(sc=>{
      sc.forEach(userscore=>{
        console.log('trying to import score ')
        console.log(userscore );
        this.firestore.collection('userscores').add(userscore);
        count ++;
      })
    })
    console.log('inserted ' + count + ' scores');
  }

  getDataCount(){
    let start = new Date('2013-01-01');

    this.firestore.collection('players').valueChanges().subscribe(p => {
      console.log('players: ' +p.length);
    })
    this.firestore.collection('gamedays').valueChanges().subscribe(p => {
      console.log('gamedays: ' +p.length);
      console.log(p);
    })
    this.firestore.collection('userscores').valueChanges().subscribe(p => {
      console.log('userscores: ' +p.length);
    })
  }

  deleteScores() {

  }

  deleteMatchdays(){
    /*let start = new Date('2013-01-01');
    var gamedays: Array<any> = new Array<any>();
    this.firestore.collection('gamedays', ref=>ref.where('date', '<', start)).snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as Score;
        const id = a.payload.doc.id;
        return {id, data};
      })
    }).subscribe(p => {
      gamedays = p;
      console.log(gamedays);
      gamedays.forEach(gd => {
        console.log('delete')
        console.log(gd);
        this.firestore.doc('gamedays/' + gd.id).delete();
      })
    });*/






  }


  importArticles(){

  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }



}
