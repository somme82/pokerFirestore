import {Component, OnInit, ViewChild} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';
import {MatDatepicker, MatDatepickerInputEvent, MatDialog} from '@angular/material';
import {Player} from '../Player';
import {GlobalVars} from '../../GlobalVars';
import {UserDialogComponent} from './user-dialog/user-dialog.component';
import {Score} from '../Score';
import {Matchday} from '../Matchday';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import {PlayerInfoDialogComponent} from './player-info-dialog/player-info-dialog.component';
import {ServerToolsComponent} from "../server-tools/server-tools.component";

@Component({
  selector: 'my-scoretable',
  templateUrl: './scoretable.component.html',
  styleUrls: ['./scoretable.component.css']
})
export class ScoretableComponent implements OnInit {
  players: any
  scores: any;
  matchdays: any;

  matchdayDate: Date;
  newMatchdayDoc: AngularFirestoreDocument<Score>;
  newMatchday: any;

  showOverAllScoreTable = false;
  @ViewChild(MatDatepicker, {static: false}) datepicker: MatDatepicker<Date>;

  constructor(private firestore: AngularFirestore, public dialog: MatDialog, public globalVars: GlobalVars, public serverTools: ServerToolsComponent) {
   this.globalVars.page='scoretable'
  }

  ngOnInit() {
    if (this.globalVars.dataInitialized == true){
      console.log("setGlobalVariables()")
      this.globalVars.setGlobalVariables();
    }
  }

  onDateChange = (e: MatDatepickerInputEvent<Date>) => {

    this.matchdayDate = e.value;
    const pushkey = this.firestore.createId();
    var matchday = {
      date: this.matchdayDate,
      venue: this.globalVars.selectedPlayer
    }

    this.firestore.collection("gamedays").doc(pushkey).set(matchday);

    if ((this.globalVars.matchdaysByYear.get(this.globalVars.currentYear).length + 1) % 4 == 0){
      this.serverTools.doBackup();
    }

    this.newMatchdayDoc = this.firestore.doc('gamedays/' + pushkey);
    this.newMatchday = this.newMatchdayDoc.snapshotChanges();
    this.globalVars.matchdayId = pushkey;
  }


  previousYear()
  {
    if (this.globalVars.matchdaysByYear.has(this.globalVars.currentYear - 1)){
      if(this.showOverAllScoreTable == false){
        this.globalVars.currentYear--;
      }
      this.globalVars.matchdayResultsObservable = Observable.of(this.globalVars.matchdayResultsByYear.get(this.globalVars.currentYear))
      this.globalVars.matchdayCount = this.globalVars.matchdaysByYear.get(this.globalVars.currentYear).length
    }
    this.showOverAllScoreTable = false;
    //this.globalVars.setGlobalVariables();

  }

  private swipeCoord?: [number, number];
  private swipeTime?: number;

  swipe(e: TouchEvent, when: string): void {
    const coord: [number, number] = [e.changedTouches[0].pageX, e.changedTouches[0].pageY];
    const time = new Date().getTime();

    if (when === 'start') {
      console.log('start')
      this.swipeCoord = coord;
      this.swipeTime = time;
    }

    else if (when === 'end') {
      const direction = [coord[0] - this.swipeCoord[0], coord[1] - this.swipeCoord[1]];
      const duration = time - this.swipeTime;

      if (duration < 1000 //Short enough
        && Math.abs(direction[1]) < Math.abs(direction[0]) //Horizontal enough
        && Math.abs(direction[0]) > 30) {  //Long enough
        const swipe = direction[0] < 0 ? 'next' : 'previous';
        if(swipe == 'next'){
          this.nextYear();
        } else{
          this.previousYear();
        }
      }
    }
  }

  nextYear()
  {
    if (this.globalVars.matchdaysByYear.has(this.globalVars.currentYear + 1)) {
      this.globalVars.currentYear++;
      this.globalVars.matchdayResultsObservable = Observable.of(this.globalVars.matchdayResultsByYear.get(this.globalVars.currentYear))
      this.globalVars.matchdayCount = this.globalVars.matchdaysByYear.get(this.globalVars.currentYear).length
    } else{
      this.showOverAllScoreTable = true;
      this.globalVars.matchdayResultsObservable = Observable.of(this.globalVars.matchdayResultsByYear.get(999))
      this.globalVars.matchdayCount = this.globalVars.matchdayResultsByYear.size - 1;
    }
    //this.globalVars.setGlobalVariables();
  }

  openUserDialog() {
    this.dialog.open(UserDialogComponent, {
      panelClass: 'fnpc-dialog'
    });
  }

  openPlayerInfoDialog(){
    this.dialog.open(PlayerInfoDialogComponent, {
      panelClass: 'fnpc-dialog'
    });
  }

  openDatepicker() {
    this.datepicker.open();
  }
}
