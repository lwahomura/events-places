import {Component} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import {User} from "../datamodels/user";
import {COMMON_ADDRESS} from "../datamodels/common_address";

@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})

export class SubscribeComponent {
  public open: boolean = false;
  public subscriberName: string = "";
  public subscriberEmail: string = "";
  public event_name: string = "";

  private baseUrl = '/api/subscribe';
  private headers: HttpHeaders = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});
  constructor(private http: HttpClient) {

  }

  readyToSend() {
    return this.subscriberName.length > 0 && this.subscriberEmail.length > 0;
  }

  subscribe(): void {
    const params = new URLSearchParams();
    params.set('name', this.subscriberName);
    params.set('email', this.subscriberEmail);
    params.set('event_name', this.event_name);
    this.http.post(COMMON_ADDRESS + this.baseUrl, params.toString(), {headers: this.headers, withCredentials: true}).subscribe(data => {
      if (data['status'] === 'success') {
        this.open = false
      } else {
        const s = document.createElement('script');
        s.type = 'text/javascript';
        s.innerHTML = 'alert(\'Подписка не удалась\');';
        document.body.appendChild(s);
      }
    })
  }

  back() {
    this.open = false;
    this.subscriberName = "";
    this.subscriberEmail = "";
  }
}
