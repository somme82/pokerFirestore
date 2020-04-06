import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ScoretableComponent } from './scoretable/scoretable.component';
import {AngularFireModule} from '@angular/fire';
import {environment} from '../environments/environment';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDatepickerModule } from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {GlobalVars} from '../GlobalVars';
import { ServerToolsComponent } from './server-tools/server-tools.component';
import { MatchdayComponent } from './matchday/matchday.component';
import { ArticlesComponent } from './articles/articles.component';
import { PlayerInfoDialogComponent } from './scoretable/player-info-dialog/player-info-dialog.component';
import { UserDialogComponent } from './scoretable/user-dialog/user-dialog.component';
import { ArticleDialogComponent } from './matchday/article-dialog/article-dialog.component';
import { MatchdayDialogComponent } from './matchday/matchday-dialog/matchday-dialog.component';
import { ScoreDialogComponent } from './matchday/score-dialog/score-dialog.component';
import { UserToMatchdayDialogComponent } from './matchday/user-to-matchday-dialog/user-to-matchday-dialog.component';
import { MatMomentDateModule } from "@angular/material-moment-adapter";



@NgModule({
  declarations: [
    AppComponent,
    ScoretableComponent,
    ServerToolsComponent,
    MatchdayComponent,
    ArticlesComponent,
    PlayerInfoDialogComponent,
    UserDialogComponent,
    ArticleDialogComponent,
    MatchdayDialogComponent,
    ScoreDialogComponent,
    UserToMatchdayDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatMomentDateModule,
    MatDatepickerModule,
    AngularFireModule.initializeApp(environment.firebase),
  ],
  providers: [GlobalVars, ServerToolsComponent],
  bootstrap: [AppComponent],
  entryComponents: [UserDialogComponent, MatchdayDialogComponent, ScoreDialogComponent, UserToMatchdayDialogComponent, ArticleDialogComponent, PlayerInfoDialogComponent]
})
export class AppModule { }
