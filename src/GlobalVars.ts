import { Injectable } from '@angular/core';

@Injectable()
export class GlobalVars {
  matchdayId: string = '';
  selectedPlayer: string =  '';
  selectedScore: string = '';
  currentYear: number = new Date().getFullYear();
}
