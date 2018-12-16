import {Component, DoCheck} from '@angular/core';
import {Router} from "@angular/router";
import {isNull} from "util";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements DoCheck {
  state = '';
  currentUser = '';
  constructor(private router: Router) {

  }

  ngDoCheck() {
    if (!this.cookieNotSet()) {
      const cookie = (this.getCookie("f_c"));
      if (!isNull(cookie)) {
        const decoded = (atob(cookie));
        const parts = decoded.split("&", -1);
        if (parts.length === 3) {
          this.currentUser = parts[1];
        }
      }
    }
  }

  toRegister() {
    this.router.navigate(['app/register']);
  }

  logout() {
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
