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
    this.articlesCollection = this.firestore.collection('matchdayarticles', ref => ref
      .orderBy('matchdayDate', 'desc'));
    this.articles = this.articlesCollection.valueChanges();
  }

}
