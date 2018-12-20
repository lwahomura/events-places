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
    if (this.openCV && !this.creationHandling) {
      console.log(this.newEvent);
      this.creationHandling = true;
    }
    if (this.gotted) {
      this.gotted = false;
      this.filterEvents();
    }
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
