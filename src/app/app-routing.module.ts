import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ScoretableComponent} from './scoretable/scoretable.component';
import {MatchdayComponent} from './matchday/matchday.component';
import {ArticlesComponent} from './articles/articles.component';
import {ServerToolsComponent} from './server-tools/server-tools.component';
import {CountdownComponent} from './countdown/countdown.component';

const routes: Routes = [
  //{ path: '', redirectTo: '/scoretable', pathMatch: 'full' },
  { path: '', redirectTo: '/scoretable', pathMatch: 'full' },
  { path: 'scoretable', component: ScoretableComponent },
  { path: 'matchday', component: MatchdayComponent },
  { path: 'articles', component: ArticlesComponent },
  { path: 'admin', component: ServerToolsComponent },
  { path: 'countdown', component: ScoretableComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
