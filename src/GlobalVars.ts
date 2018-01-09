import { Injectable } from '@angular/core';
import {MatDialog} from '@angular/material';
import {Email} from "./app/Email";
import {Headers, Http, RequestOptions, Response} from '@angular/http';
import {Matchday} from "./app/Matchday";

@Injectable()
export class GlobalVars {
  matchdayId: string = '';
  selectedPlayer: string =  '';
  selectedScore: string = '';
  currentYear: number = new Date().getFullYear();
  showAllPlayers: boolean = false;
  matchdayLeadingPlayer: string;


  matchdaysInitialized = false;
  matchdayResults: any;
  matchdayResultsByYear: any;
  matchdaysByYear: Map<number, Array<Matchday>> = new Map<number, Array<Matchday>>()
  matchdayCount: number = 0



  user: any = []
  matchdays: any = []
  scores: any = []
  articles: any = []
  firestore_data: any = []

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

  setSelectedPlayer(name) {
    this.selectedPlayer = name;
  }

}
