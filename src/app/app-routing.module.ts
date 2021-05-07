import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {HomeComponent} from './home/home.component';
import {MyPoemsComponent} from './my-poems/my-poems.component';

export const routes: Routes = [
  {path: 'my_poems', component: MyPoemsComponent},
  {path: 'home', component: HomeComponent},
  {path: '**', redirectTo: 'home'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
