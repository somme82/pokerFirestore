import { Component, OnInit } from '@angular/core';
import {GlobalVars} from "../../GlobalVars";
import {Email} from "../Email";
import {Headers, Http, RequestOptions, Response} from '@angular/http';
import {Score} from "../Score";
import {AngularFirestore, AngularFirestoreCollection} from "angularfire2/firestore";
import {Player} from "../Player";




@Component({
  selector: 'my-server-tools',
  templateUrl: './server-tools.component.html',
  styleUrls: ['./server-tools.component.css']
})
export class ServerToolsComponent implements OnInit {

  playerCollection: AngularFirestoreCollection<Player>;
  player: any

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
      playerJson = JSON.stringify(p)
      //options.headers.append('content-type', 'application/json')
      console.log(playerJson);

      var body = {
        text: playerJson
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


  }


  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }



}
