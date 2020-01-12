import { Component, OnInit } from '@angular/core';
import {GlobalVars} from '../../../GlobalVars';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from '@angular/fire/firestore';
import {MatchdayComponent} from '../matchday.component';
import {Score} from '../../Score';
import {Player} from '../../Player';
import {Matchday} from '../../Matchday';
import {Article} from '../../Article';

@Component({
  selector: 'my-article-dialog',
  templateUrl: './article-dialog.component.html',
  styleUrls: ['./article-dialog.component.css']
})
export class ArticleDialogComponent implements OnInit {

  articleText: string;

  playerDoc: AngularFirestoreDocument<Player>;
  player: any;

  matchdayDoc: AngularFirestoreDocument<Matchday>;
  matchday: any;

  venueDoc: AngularFirestoreDocument<Player>;
  venue: any;

  article: Article = new Article();

  articleCollection: AngularFirestoreCollection<Article>;
  articleDoc: any

  currentArticle: AngularFirestoreCollection<Article>;
  currentArticleDoc: any

  articleId: string = '';

  constructor(private firestore: AngularFirestore, public globalVars: GlobalVars) {}

  ngOnInit() {
    this.currentArticle = this.firestore.collection('matchdayarticles', ref => ref.where('matchdayId', '==', this.globalVars.matchdayId))
    this.currentArticleDoc = this.currentArticle.snapshotChanges()
      .map(actions => {
        return actions.map( a => {
          const data = a.payload.doc.data() as unknown as Matchday;
          const id = a.payload.doc.id;
          return {id, data};
        });
      });
    this.currentArticleDoc.subscribe(ca=>{
      ca.forEach(c => {
        this.articleId = c.id;
        this.articleText = c.data.text;
      })
    })
  }

  addArticle()
  {
    var id = '';
    if (this.articleId == '')
    {
      id = this.firestore.createId();
    } else {
      id = this.articleId;
    }
    var newArticle = {
      text: this.articleText,
      player: this.globalVars.matchdaysMap.get(this.globalVars.matchdayId).results[0].data.player,
      matchdayDate: this.globalVars.matchdaysMap.get(this.globalVars.matchdayId).data.date,
      matchdayVenue: this.globalVars.matchdaysMap.get(this.globalVars.matchdayId).data.venue,
      matchdayId: this.globalVars.matchdayId,
      imported: false
    }

    this.firestore.collection('matchdayarticles').doc(id).set(newArticle)
    this.globalVars.closeAllDialogs();
  }

  deleteArticle()
  {
    this.articleCollection = this.firestore.collection('matchdayarticles', ref => ref.where('matchdayId', '==', this.globalVars.matchdayId));
    this.articleDoc = this.articleCollection.snapshotChanges()
      .map(actions => {
        return actions.map( a => {
          const data = a.payload.doc.data() as unknown as Score;
          const id = a.payload.doc.id;
          return {id, data};
        });
      });
    this.articleDoc.subscribe(sc => {
      this.articleDoc = sc;
      if (this.articleDoc && this.articleDoc.length > 0) {
        this.articleDoc.forEach(a =>{
            this.firestore.doc('matchdayarticles/' + a.id).delete();
          }
        );
      }
    });
    this.globalVars.closeAllDialogs();
  }

}
