import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ScoretableComponent } from './scoretable/scoretable.component';
import {AngularFirestoreModule} from 'angularfire2/firestore';
import {environment} from '../environments/environment';
import {AngularFireModule} from 'angularfire2';
import {MatDatepickerModule, MatDialogModule, MatNativeDateModule} from '@angular/material';
import {GlobalVars} from '../GlobalVars';
import { UserDialogComponent } from './scoretable/user-dialog/user-dialog.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MatchdayComponent } from './matchday/matchday.component';
import { MatchdayDialogComponent } from './matchday/matchday-dialog/matchday-dialog.component';
import { ScoreDialogComponent } from './matchday/score-dialog/score-dialog.component';
import { UserToMatchdayDialogComponent } from './matchday/user-to-matchday-dialog/user-to-matchday-dialog.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFirestoreModule.enablePersistence(),
    MatDialogModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  declarations: [
    AppComponent,
    ScoretableComponent,
    UserDialogComponent,
    MatchdayComponent,
    MatchdayDialogComponent,
    ScoreDialogComponent,
    UserToMatchdayDialogComponent

  ],
  providers: [GlobalVars],
  bootstrap: [AppComponent],
  entryComponents: [UserDialogComponent, MatchdayDialogComponent, ScoreDialogComponent, UserToMatchdayDialogComponent]
})
export class AppModule { }
