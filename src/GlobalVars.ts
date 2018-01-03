import { Injectable } from '@angular/core';
import {MatDialog} from '@angular/material';

@Injectable()
export class GlobalVars {
  matchdayId: string = '';
  selectedPlayer: string =  '';
  selectedScore: string = '';
  currentYear: number = new Date().getFullYear();
  showAllPlayers: boolean = false;
  matchdayLeadingPlayer: string;


  constructor(public dialog: MatDialog) { }

  closeDialog() {
    this.dialog.closeAll();
  }

}
