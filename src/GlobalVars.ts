import { Injectable } from '@angular/core';
import {MatDialog} from '@angular/material';
import {Email} from "./app/Email";
import {Headers, Http, RequestOptions, Response} from '@angular/http';
import {Matchday} from "./app/Matchday";
import {Observable} from "rxjs/Observable";

@Injectable()
export class GlobalVars {

  //Initialisation variables
  matchdayId: string = '';
  selectedPlayer: string =  '';
  selectedScore: string = '';
  currentYear: number = new Date().getFullYear();
  matchdayCount: number = 0
  matchdayLeadingPlayer: string;
  currentMatchday: any = {
    data:{}
  }
  venue: string = '';
  date: Date;
  dataInitialized = false;
  page = ''

  //Behaviour variables
  showAllPlayers = false;

  //BEGIN help container
  matchdayResultsByYear: any;
  matchdaysByYear: Map<number, Array<any>> = new Map<number, Array<any>>()
  playersMap: Map<string, any> = new Map<string, any>();
  currentMatchdayResults: any;
  matchdaysMap: Map<string, any> = new Map<string, any>();

  //Import container
  user: any = []
  matchdays: any = []
  scores: any = []
  articles: any = []




  firestore_data: any = []


  //Observables
  matchdayResultsObservable: any;
  currentMatchdayResultsObservable: any;

  constructor(public dialog: MatDialog, private http: Http) { }

  closeAllDialogs() {
    this.dialog.closeAll();
  }

  toggleshowAllPlayersFlag()
  {
    if(this.showAllPlayers){
      this.showAllPlayers = false;
    } else{
      this.showAllPlayers = true;
    }
  }

  setSelection(playerId, scoreId) {
    this.selectedPlayer = playerId;
    if (scoreId != '') {
      this.selectedScore = scoreId;
    }
    console.log(playerId)
  }
 
  setGlobalVariables(){
    
    this.matchdayId = this.matchdaysByYear.get(this.currentYear)[this.matchdaysByYear.get(this.currentYear).length - 1].id;
    this.currentMatchdayResults = this.matchdaysByYear.get(this.currentYear).find(m=>m.id==this.matchdayId);
    this.currentMatchdayResults.results = this.currentMatchdayResults.results.sort(function (a, b) {
      return b.data.totalscore - a.data.totalscore;
    });

    this.matchdayResultsObservable = Observable.of(this.matchdayResultsByYear.get(this.currentYear))
    this.matchdayCount = this.matchdaysByYear.get(this.currentYear).length

    this.currentMatchdayResultsObservable = Observable.of(this.currentMatchdayResults.results)
    this.currentMatchday = this.matchdaysMap.get(this.matchdayId);
    this.venue = this.matchdaysMap.get(this.matchdayId).data.playerName;
    this.date = this.matchdaysMap.get(this.matchdayId).data.date.toDate();
    this.dataInitialized = true;
  }

  getPlayerNameById(id){
    if (this.playersMap.has(id)){
      return this.playersMap.get(id).data.name
    }
    return '?'
  }

  getPlayerAvatarById(id){
    if (this.playersMap.has(id)){
      if (this.playersMap.get(id).data.avatar)
      {
        return this.playersMap.get(id).data.avatar
      }else{
        return 'empty.jpg'
      }

    }
    return 'empty.jpg'
  }

}
