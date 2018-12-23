import {Component} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import {User} from "../datamodels/user";
import {COMMON_ADDRESS} from "../datamodels/common_address";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent {
  public open: boolean;
  acc_type = ['', 'организатор', 'арендодатель'];
  user = new User('', '', '', '', '');
  private baseUrl = '/api/register';
  private headers: HttpHeaders = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});
  constructor(private http: HttpClient) {

  }

  readyToSend() {
    const EmailReg = /[^@.]+@[^@.]+\.[^@.]+/;
    return this.user.username.length !== 0 && this.user.username.length < 20 &&
      this.user.password.length !== 0 && this.user.password.length < 20 &&
      this.user.a_t.length !== 0 &&
      this.user.name.length != 0 && this.user.name.length < 20 &&
      this.user.email.length != 0 && EmailReg.test(this.user.email)
  }

  register(): void {
    const params = new URLSearchParams();
    params.set('username', this.user.username);
    params.set('password', this.user.password);
    params.set('name', this.user.name);
    params.set('email', this.user.email);
    let nType = '';
    if (this.user.a_t === "организатор") {
      nType = '0';
    }
    if (this.user.a_t === "арендодатель") {
      nType = '1';
    }
    params.set('type', nType);
    this.http.post(COMMON_ADDRESS + this.baseUrl, params.toString(), {headers: this.headers, withCredentials: true}).subscribe(data => {
      if (data['status'] === 'success') {
        this.setCookie("f_c", data['cookie']);
        this.open = false
      } else {
        const s = document.createElement('script');
        s.type = 'text/javascript';
        s.innerHTML = 'alert(\'Регистрация не удалась\');';
        document.body.appendChild(s);
      }
    })
  }

  back() {
    this.open = false;
    this.user = new User('', '', '', '', '');
  }

  setCookie(name: string, val: string) {
    const date = new Date();
    const value = val;

    date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + value + "; expires =" + date.toUTCString() + "; path=/"
  }
}
