import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ScoretableComponent} from './scoretable/scoretable.component';
import {MatchdayComponent} from './matchday/matchday.component';

const routes: Routes = [
  { path: '', redirectTo: '/scoretable', pathMatch: 'full' },
  { path: 'scoretable', component: ScoretableComponent },
  { path: 'matchday', component: MatchdayComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
