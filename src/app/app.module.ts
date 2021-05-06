import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ExampleComponent} from './example/example.component';
import {HomeComponent} from './home/home.component';
import {LoginButtonComponent} from './login-button/login-button.component';
import {MaterialModule} from './material/material.module';
import {MyPoemsComponent} from './my-poems/my-poems.component';
import {NavigationComponent} from './navigation/navigation.component';

@NgModule({
  declarations: [
    AppComponent,
    ExampleComponent,
    LoginButtonComponent,
    HomeComponent,
    NavigationComponent,
    MyPoemsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialModule,
    HttpClientModule,
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {appearance: 'fill'},
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
