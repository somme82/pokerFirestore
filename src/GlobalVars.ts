import { Injectable } from '@angular/core';
import {MatDialog} from '@angular/material';
import {Email} from "./app/Email";
import {Headers, Http, RequestOptions, Response} from '@angular/http';

@Injectable()
export class GlobalVars {
  matchdayId: string = '';
  selectedPlayer: string =  '';
  selectedScore: string = '';
  currentYear: number = new Date().getFullYear();
  showAllPlayers: boolean = false;
  matchdayLeadingPlayer: string;


  constructor(public dialog: MatDialog, private http: Http) { }

  closeDialog() {
    this.dialog.closeAll();
  }

  getEnvironmentConfiguration(): Promise<Email>{
    return this.http
      .get('https://us-central1-friday-night-poker.cloudfunctions.net/getEnvironmentConfiguration').toPromise()
      .then(res => res.json())
      .catch(this.handleError)
  }


  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
