import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {RouterComponent} from "./app-router.module";
import {LoginComponent} from "./login/login.component";
import {HttpClientModule} from "@angular/common/http";
import {RegisterComponent} from "./register/register.component";
import {CookieService} from "angular2-cookie/core";
import {FormsModule} from "@angular/forms";
import {PlaceComponent} from "./place/place.component";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {EventComponent} from "./events/event.component";
import {SubscribeComponent} from "./subscribe/subscribe.component";

@NgModule({
  declarations: [
    AppComponent,
    RouterComponent,
    LoginComponent,
    RegisterComponent,
    PlaceComponent,
    EventComponent,
    SubscribeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    PerfectScrollbarModule
  ],
  providers: [],
  bootstrap: [RouterComponent]
})
export class AppModule { }
