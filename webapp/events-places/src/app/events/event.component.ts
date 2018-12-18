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

  public creationHandling: boolean = false;
  public onlyMine: boolean = false;
  public eventName: string = "";
  public placeName: string = "";
  public minDate: string = "";
  public maxDate: string = "";

  public mineOpts = [false, true];

  public newEvent: Event;
  public events: Event[];
  public filtredEvents: Event[];
  public currentEvent: Event;
  public updateEvent: Event;
  public currentId: number;
  private baseUrl = "/api/events";
  private updateUrl = "/api/eventsupdate";

  private headers: HttpHeaders = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});

  constructor(private http: HttpClient) {
    this.events = [];
    this.filtredEvents = [];
    this.currentId = -1;
    this.newEvent = new Event({organizer: this.currUser(), room_name: "", event_name: "", event_date: ""});
    this.updateEvent = new Event({organizer: "", room_name: "", event_name: "", event_date: ""});
  }

  ngOnInit() {
    this.http.get(COMMON_ADDRESS + this.baseUrl).subscribe(data => {
      if (data['response']['status'] === 'success') {
        const ev = data['response'];
        for (const item of ev) {
          const e = new Event(item);
          this.events.push(e);
        }
      }
    });
    this.events.push({organizer: "user", room_name: "room 1", event_name: "event 1", event_date: ""});
    this.events.push({organizer: "user 1", room_name: "room 2", event_name: "event 2", event_date: ""});

    this.filterEvents();

    if (this.filtredEvents.length > 0) {
      this.currentId = 0;
      this.currentEvent = this.filtredEvents[this.currentId];
    } else {
      this.currentId = -1;
      this.currentEvent = new Event({organizer: "", room_name: "", event_name: "", event_date: ""});
    }
  }

  ngDoCheck() {
    if (this.openCV && !this.creationHandling) {
      console.log(this.newEvent);
      this.creationHandling = true;
    }
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

  filterEvents() {
    const placeNameRegexp = new RegExp(this.placeName);
    const eventNameRegexp = new RegExp(this.eventName);
    this.filtredEvents.length = 0;
    for (const item of this.events) {
      if (((this.onlyMine && item.organizer === this.currUser()) || !this.onlyMine) &&
        // ((this.minCost == 0 ) || item.costs >= this.minCost) &&
        // ((this.maxCost == Infinity ) || item.costs <= this.maxCost) &&
        // ((this.minSpace == 0 ) || item.square >= this.minSpace) &&
        // ((this.maxSpace == Infinity ) || item.square <= this.maxSpace) &&
        (placeNameRegexp.test(item.room_name) && eventNameRegexp.test(item.event_name))
      ){
        this.filtredEvents.push(item);
      }
    }
    this.currentId = 0;
    this.currentEvent = this.filtredEvents[this.currentId];
  }
}
