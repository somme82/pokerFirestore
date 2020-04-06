import { Component, OnInit } from '@angular/core';
import {GlobalVars} from '../../GlobalVars';
import {MatDialog} from '@angular/material/dialog';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Article} from '../Article';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {


  articlesCollection: AngularFirestoreCollection<Article>;
  articles: any;

  constructor(private firestore: AngularFirestore, public dialog: MatDialog, public globalVars: GlobalVars) {
    this.globalVars.page='articles'
   }

  ngOnInit() {
    
    console.log(this.globalVars.playersMap )
    this.articlesCollection = this.firestore.collection('matchdayarticles', ref => ref
      .orderBy('matchdayDate', 'desc'));
    this.articles = this.articlesCollection.snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          var playerName = '?';
          if(this.globalVars.playersMap.has(data.player)){
            playerName = this.globalVars.playersMap.get(data.player).data.name
          }
          var venuePlayer = '?';
          if(this.globalVars.playersMap.get(data.matchdayVenue)){
            venuePlayer = this.globalVars.playersMap.get(data.matchdayVenue).data.name
          }
          var avatar = this.globalVars.getPlayerAvatarById(data.player)

          return {id, playerName, venuePlayer, avatar, data};
        });
      });

  }

}
