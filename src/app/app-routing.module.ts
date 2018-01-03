import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ScoretableComponent} from './scoretable/scoretable.component';
import {MatchdayComponent} from './matchday/matchday.component';
import {ArticlesComponent} from './articles/articles.component';

const routes: Routes = [
  { path: '', redirectTo: '/scoretable', pathMatch: 'full' },
  { path: 'scoretable', component: ScoretableComponent },
  { path: 'matchday', component: MatchdayComponent },
  { path: 'articles', component: ArticlesComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
