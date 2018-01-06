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

      this.matchdayCollection = this.firestore.collection('matchdays', ref => ref.orderBy('date', 'asc'));
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

        this.scoreCollection = this.firestore.collection('scores', ref=> ref.orderBy('matchdayDate', 'asc'));
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

          this.articleCollection = this.firestore.collection('articles', ref=> ref.orderBy('matchdayDate', 'asc'));
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

            console.log(body);


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


  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }



}
