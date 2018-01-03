import { Component, OnInit } from '@angular/core';
import {GlobalVars} from '../../GlobalVars';
import {MatDialog} from '@angular/material';
import {AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';
import {Matchday} from '../Matchday';
import {Article} from '../Article';
import {Player} from '../Player';

@Component({
  selector: 'my-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {


  articlesCollection: AngularFirestoreCollection<Article>;
  articles: any;

  constructor(private firestore: AngularFirestore, public dialog: MatDialog, public globalVars: GlobalVars) { }

  ngOnInit() {


    let start = new Date(this.globalVars.currentYear + '-01-01');
    let end = new Date(this.globalVars.currentYear + '-12-31');

    this.articlesCollection = this.firestore.collection('articles', ref => ref
      .where('matchdayDate', '>', start)
      .where('matchdayDate', '<', end));
    this.articles = this.articlesCollection.valueChanges();
  }

}
