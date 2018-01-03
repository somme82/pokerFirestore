import { Component, OnInit } from '@angular/core';
import {GlobalVars} from '../../../GlobalVars';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
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

  constructor(private firestore: AngularFirestore, public globalVars: GlobalVars) {}

  ngOnInit() {
    this.playerDoc = this.firestore.doc('players/' + this.globalVars.matchdayLeadingPlayer);
    this.player = this.playerDoc.valueChanges();
    this.player.subscribe(value => {
      this.player = value;
      this.article.player = value.name;

      this.matchdayDoc = this.firestore.doc('matchdays/' + this.globalVars.matchdayId);
      this.matchday = this.matchdayDoc.valueChanges();
      this.matchday.subscribe(md => {
        this.matchday = md;
        this.article.matchdayDate = md.date;

        this.venueDoc = this.firestore.doc('players/' + md.venue);
        this.venue = this.venueDoc.valueChanges();
        this.venue.subscribe(v => {
          this.venue = v;
          this.article.matchdayVenue = v.name;

          this.currentArticle = this.firestore.collection('articles', ref => ref.where('matchdayId', '==', this.globalVars.matchdayId))
          this.currentArticleDoc = this.currentArticle.snapshotChanges()
            .map(actions => {
              return actions.map( a => {
                const data = a.payload.doc.data() as Matchday;
                const id = a.payload.doc.id;
                return {id, data};
              });
            });
          this.currentArticleDoc.subscribe(ca=>{
            ca.forEach(c => {
              
            })
          })



        })
      });
    });
  }

  addArticle()
  {
    this.article.text = this.articleText;
    this.firestore.collection('articles').add({
      text: this.article.text,
      matchdayDate: this.article.matchdayDate,
      matchdayVenue: this.article.matchdayVenue,
      matchdayId: this.globalVars.matchdayId,
      player: this.article.player,

    })
    this.globalVars.closeDialog();
  }

  deleteArticle()
  {
    this.articleCollection = this.firestore.collection('articles', ref => ref.where('matchdayId', '==', this.globalVars.matchdayId));
    this.articleDoc = this.articleCollection.snapshotChanges()
      .map(actions => {
        return actions.map( a => {
          const data = a.payload.doc.data() as Score;
          const id = a.payload.doc.id;
          return {id, data};
        });
      });
    this.articleDoc.subscribe(sc => {
      this.articleDoc = sc;
      if (this.articleDoc && this.articleDoc.length > 0) {
        this.articleDoc.forEach(a =>{
            this.firestore.doc('articles/' + a.id).delete();
          }
        );
      }
    });
  }

}
