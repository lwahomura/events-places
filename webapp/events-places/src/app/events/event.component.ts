import {Component, DoCheck, OnInit} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {isNull} from "util";
import {Event} from "../datamodels/event"
import {COMMON_ADDRESS} from "../datamodels/common_address";

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss']
})

export class EventComponent implements OnInit, DoCheck {
  public openCV: boolean = false;
  public openUV: boolean = false;
  public openDV: boolean = false;
  public openSV: boolean = false;
  public gotted: boolean = false;

  public creationHandling: boolean = false;
  public onlyMine: boolean = false;
  public eventName: string = "";
  public placeName: string = "";
  public minCost: number = 0;
  public maxCost: number = Infinity;
  public minDate: string = "1970-01-01";
  public maxDate: string = "2070-01-01";

  public mineOpts = [false, true];

  public newEvent: Event;
  public events: Event[];
  public filtredEvents: Event[];
  public currentEvent: Event;
  public updateEvent: Event;
  public currentId: number;
  private baseUrl = "/api/events";
  private updateUrl = "/api/eventsupdate";
  private deleteUrl = "/api/eventsdelete";

  public subscriberName: string = "";
  public subscriberEmail: string = "";


  private headers: HttpHeaders = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});

  constructor(private http: HttpClient) {
    this.events = [];
    this.filtredEvents = [];
    this.currentId = -1;
    this.newEvent = new Event({organizer: this.currUser(), room_name: "", event_name: "", event_date: "", event_costs: 0});
    this.updateEvent = new Event({organizer: "", room_name: "", event_name: "", event_date: "", event_costs: 0});
    this.currentEvent = new Event({organizer: "", room_name: "", event_name: "", event_date: "", event_costs: 0});
  }

  ngOnInit() {
    // this.events.push({organizer: "user", room_name: "room 1", event_name: "event 1", event_date: "2018-22-07", event_costs: 10});
    // this.events.push({organizer: "user 1", room_name: "room 2", event_name: "event 2", event_date: "2018-01-02", event_costs: 35});
    this.http.get(COMMON_ADDRESS + this.baseUrl).subscribe(data => {
      if (data['status'] === 'success') {
        const ev = data['response'];
        for (const item of ev) {
          const e = new Event(item);
          this.events.push(e);
        }
      }
      this.gotted = true
    }, error => {
      this.gotted = true;
    });
  }

  ngDoCheck() {
    if (!this.openCV && this.creationHandling) {
      this.creationHandling = false;
      this.openCV = true;
    }
    if (this.gotted) {
      this.gotted = false;
      this.filterEvents();
    }
  }

  canPressSave() {
    return this.openCV;
  }

  stopCreating() {
    this.newEvent = new Event({organizer: this.currUser(), room_name: "", event_name: "", event_date: "", event_costs: 0})
    this.openCV = false;
  }

  canCreate() {
    return this.newEvent.event_name.length > 0 && this.newEvent.event_date.length > 0 && this.newEvent.event_costs > 0;
  }

  createEvent() {
    const params = new URLSearchParams();
    params.set('event_name', this.newEvent.event_name);
    params.set('room_name', this.newEvent.room_name);
    params.set('organizer', this.newEvent.organizer);
    params.set('event_date', this.newEvent.event_date);
    params.set('event_costs', this.newEvent.event_costs.toString());
    this.http.post(COMMON_ADDRESS + this.baseUrl, params.toString(), {headers: this.headers, withCredentials: true}).subscribe(data => {
      if (data['status'] === 'success') {
        window.location.reload();
      } else {
        const s = document.createElement('script');
        s.type = 'text/javascript';
        s.innerHTML = 'alert(\'Добавление не удалось\');';
        document.body.appendChild(s);
      }
    })
  }

  canPressUpdate() {
    return this.currType() == '2' && this.currentId != -1 && !this.openUV && !this.openDV;
  }

  canPressUpdateSave() {
    return this.currType() == '2' && this.currentId != -1 && this.openUV;
  }

  update() {
    this.updateEvent.event_costs = this.currentEvent.event_costs;
    this.updateEvent.event_name = this.currentEvent.event_name;
    this.updateEvent.room_name = this.currentEvent.room_name;
    this.updateEvent.organizer = this.currentEvent.organizer;
    this.updateEvent.event_date = this.currentEvent.event_date;
    this.openUV = true;
  }

  stopUpdating() {
    this.openUV = false;
  }

  canUpdate() {
    return this.currentEvent.event_date != this.updateEvent.event_date ||
      this.currentEvent.event_costs != this.updateEvent.event_costs
  }

  updateThisEvent() {
    const params = new URLSearchParams();
    params.set('event_name', this.newEvent.event_name);
    params.set('room_name', this.newEvent.room_name);
    params.set('organizer', this.newEvent.organizer);
    params.set('event_date', this.newEvent.event_date);
    params.set('event_date', this.newEvent.event_date);
    this.http.post(COMMON_ADDRESS + this.updateUrl, params.toString(), {headers: this.headers, withCredentials: true}).subscribe(data => {
      if (data['status'] === 'success') {
        window.location.reload();
      } else {
        const s = document.createElement('script');
        s.type = 'text/javascript';
        s.innerHTML = 'alert(\'Изменение не удалось\');';
        document.body.appendChild(s);
      }
    })
  }

  canPressDelete() {
    return this.currType() == '2' && this.currentId != -1 && !this.openUV && !this.openDV;
  }

  canPressDeleteSave() {
    return this.openDV;
  }

  delete() {
    this.openDV = true;
  }

  stopDeleting() {
    this.openDV = false;
  }

  deleteEvent() {
    const params = new URLSearchParams();
    params.append('event_name', this.currentEvent.event_name);
    this.http.post(COMMON_ADDRESS + this.deleteUrl, params.toString(), {headers: this.headers, withCredentials: true}).subscribe(data => {
      if (data['status'] === 'success') {
        window.location.reload();
      } else {
        const s = document.createElement('script');
        s.type = 'text/javascript';
        s.innerHTML = 'alert(\'Удаление не удалось\');';
        document.body.appendChild(s);
      }
    })
  }

  formsDisabled() {
    return this.currType() != "2" || this.currentId == -1 || !this.openUV;
  }

  notShowPrev() {
    return this.filtredEvents.length === 0 || this.currentId === 0;
  }

  notShowNext() {
    return  this.filtredEvents.length === 0 || this.currentId === this.filtredEvents.length - 1;
  }

  toPrev() {
    this.currentId -= 1;
    this.currentEvent = this.filtredEvents[this.currentId];
  }

  toNext() {
    this.currentId += 1;
    this.currentEvent = this.filtredEvents[this.currentId];
  }

  filterEvents() {
    const placeNameRegexp = new RegExp(this.placeName);
    const eventNameRegexp = new RegExp(this.eventName);
    this.filtredEvents.length = 0;
    for (const item of this.events) {
      if (((this.onlyMine && item.organizer === this.currUser()) || !this.onlyMine) &&
        ((this.minCost == 0 ) || item.event_costs >= this.minCost) &&
        ((this.maxCost == Infinity ) || item.event_costs <= this.maxCost) &&
        (item.event_date >= this.minDate) &&
        (item.event_date <= this.maxDate) &&
        (placeNameRegexp.test(item.room_name) && eventNameRegexp.test(item.event_name))
      ){
        this.filtredEvents.push(item);
      }
    }
    if (this.filtredEvents.length > 0) {
      this.currentId = 0;
      this.currentEvent = this.filtredEvents[this.currentId];
    } else {
      this.currentId = -1;
      this.currentEvent = new Event({organizer: "", room_name: "", event_name: "", event_date: ""});
    }
  }

  filtersValid() {
    return (this.minCost >= 0) &&
      (this.maxCost >= 0) &&
      (this.minCost <= this.maxCost) &&
      (this.minDate <= this.maxDate)
  }

  filtersBack() {
    this.onlyMine = false;
    this.placeName = "";
    this.eventName = "";
    this.minCost = 0;
    this.maxCost = Infinity;
    this.minDate = "1970-01-01";
    this.maxDate = "2070-01-01";

    this.filterEvents();
  }

  currType() {
    const cookie = (this.getCookie("f_c"));
    if (!isNull(cookie)) {
      const decoded = (atob(cookie));
      const parts = decoded.split("&", -1);
      if (parts.length === 2) {
        return parts[0];
      }
    }
    return ""
  }

  currUser() {
    const cookie = (this.getCookie("f_c"));
    if (!isNull(cookie)) {
      const decoded = (atob(cookie));
      const parts = decoded.split("&", -1);
      if (parts.length === 2) {
        return parts[1];
      }
    }
    return ""
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
