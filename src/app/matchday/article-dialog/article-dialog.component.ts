import { Component, OnInit } from '@angular/core';
import {GlobalVars} from '../../../GlobalVars';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
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

  constructor(private firestore: AngularFirestore, public globalVars: GlobalVars) {}

  ngOnInit() {
      console.log(this.globalVars.matchdayLeadingPlayer);
  }

  addArticle()
  {
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
          this.article.matchdayVenue = v.name;


          this.article.text = this.articleText;
          this.firestore.collection('articles').add({
            text: this.article.text,
            matchdayDate: this.article.matchdayDate,
            matchdayVenue: this.article.matchdayVenue,
            player: this.article.player
          })
        })
      });
    });

  }

}
