import { Component, OnInit } from '@angular/core';
import {GlobalVars} from "../../GlobalVars";
import {Email} from "../Email";
import {Headers, Http, RequestOptions, Response} from '@angular/http';
import {Score} from "../Score";
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Player} from "../Player";
import {Matchday} from "../Matchday";
import {Article} from "../Article";
import * as moment from 'moment';




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
    this.playerCollection = this.firestore.collection('players', ref => ref
      .orderBy('name', 'asc')
    );
    this.player = this.playerCollection.snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as unknown as Score;
          const id = a.payload.doc.id;
          return {id, data};
        });
      });
    this.player.subscribe(p=>{
      console.log('adding players to backup...');
      console.log(p);
      this.backup.push({
        players: p
      })

      this.matchdayCollection = this.firestore.collection('gamedays', ref => ref.orderBy('date', 'asc'));
      this.matchday = this.matchdayCollection.snapshotChanges()
        .map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data() as unknown as Score;
            const id = a.payload.doc.id;
            return {id, data};
          });
        });
      this.matchday.subscribe(m=>{
        console.log('adding matchdays to backup...');
        console.log(m);
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
          console.log('adding scores to backup...');
          console.log(s);
          this.backup.push({
            scores: s
          })

          this.articleCollection = this.firestore.collection('matchdayarticles', ref=> ref.orderBy('matchdayDate', 'asc'));
          this.article = this.articleCollection.snapshotChanges()
            .map(actions => {
              return actions.map(a => {
                const data = a.payload.doc.data() as unknown as Score;
                const id = a.payload.doc.id;
                return {id, data};
              });
            });
          this.article.subscribe(a=>{
            console.log('adding articles to backup...');
            console.log(a);
            this.backup.push({
              articles: a
            })

            let date =  moment();
            var body = {
              text: JSON.stringify(this.backup),
              name: 'fnpc-backup-' + date.format('YYYY-MM-DD') + '.json'
            }
            console.log('backup ready to send...');
            console.log(this.backup);

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

  setAvatars(){
    this.playerCollection = this.firestore.collection('players');
    this.player = this.playerCollection.snapshotChanges()
      .map(actions => {
        return actions.map((a) => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return {id, data};
        })
      });

    var availableAvatars = ['adil', 'andi hartmann', 'andi', 'chris', 'dirk', 'heiko', 'markus', 'sebastian batho', 'steff', 'tim', 'tobse'];
    this.player.subscribe( pl =>{
      this.player = pl;
      if(pl && pl.length > 0){
        pl.forEach(p=>{
          console.log(p);
          if (availableAvatars.some(a => a == p.data.name.toLowerCase())){

            /*this.firestore.doc('players/' + p.id).update({
              avatar: p.data.name.toLowerCase() + '.jpg'
            })*/
          }

        })
      }
    })
  }

  setMatchdaysMap(){
    var matchdays = this.globalVars.matchdaysMap;
    var count = 0;

    var allMatchdays: Array<any> = new Array<any>();
    matchdays.forEach(m=>{
      var tempDate = moment(m.data.date.getUTCFullYear() + '-' + (m.data.date.getUTCMonth() + 1) + '-' + m.data.date.getUTCDate()).format('YYYY-MM-DD')
      m.tempDate = tempDate;
      allMatchdays.push(m)
    })

    this.globalVars.articles.forEach(a=>{
      if(allMatchdays.some(m=>m.tempDate == a.date)){



        var matchday = allMatchdays.find(m=>m.tempDate == a.date);
        console.log(matchday.results[0])
        var article = {
          text: a.text,
          matchdayDate: new Date(a.date),
          matchdayVenue: matchday.data.venue,
          matchdayId: matchday.id,
          player: matchday.results[0].data.player,
          imported: true
        }
        this.firestore.collection('matchdayarticles').add(article);
      } else{
      }
    })

    console.log(allMatchdays)

    console.log('###### matchdayMap #####');
    console.log('Neu anzulegen: ' + count);
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
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }



}
