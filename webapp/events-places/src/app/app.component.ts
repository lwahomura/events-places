import {Component, DoCheck, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {isNull} from "util";
import {Register} from "ts-node";
import {RegisterComponent} from "./register/register.component";
import {PlaceComponent} from "./place/place.component";
import {EventComponent} from "./events/event.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements DoCheck {
  state = '';
  currentUser = '';

  @ViewChild(RegisterComponent) regComp: RegisterComponent;
  @ViewChild(PlaceComponent) placeComp: PlaceComponent;
  @ViewChild(EventComponent) eventComp: EventComponent;

  constructor() {}

  ngDoCheck() {
    if (!this.cookieNotSet()) {
      const cookie = (this.getCookie("f_c"));
      if (!isNull(cookie)) {
        const decoded = (atob(cookie));
        const parts = decoded.split("&", -1);
        if (parts.length === 2) {
          this.currentUser = parts[1];
        }
      }
    }
    if (this.placeComp.bindingEvent) {
      this.state = 'events';
      this.placeComp.bindingEvent = false;
      this.eventComp.openCV = true;
      this.eventComp.newEvent.room_name = this.placeComp.currentPlace.room_name;
    }
  }

  toRegister() {
    this.regComp.open = true
  }

  logout() {
    window.location.reload();
    this.deleteCookie("f_c");
  }

  deleteCookie(name: string) {
    const date = new Date();
    // Set it expire in -1 days
    date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));

    // Set it
    document.cookie = name + "=; expires=" + date.toUTCString() + "; path=/";
  }

  setState(st: string) {
    this.state = st;
    if (st === 'events') {
      this.placeComp.openUP = false;
    }
  }

  hideChoice() {
    return this.state.length !== 0 ;
  }

  cookieNotSet() {
    return isNull(this.getCookie("f_c"));
  }

  getCookie(name: string) {
    const nameLenPlus = (name.length + 1);
    return document.cookie
      .split(';')
      .map(c => c.trim())
      .filter(cookie => {
        return cookie.substring(0, nameLenPlus) === `${name}=`;
      })
      .map(cookie => {
        return decodeURIComponent(cookie.substring(nameLenPlus));
      })[0] || null;
  }
}
