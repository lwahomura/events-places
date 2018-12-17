import {Component, OnInit} from "@angular/core";
import {Place} from "../datamodels/place";
import {COMMON_ADDRESS} from "../datamodels/common_address";
import {HttpClient} from "@angular/common/http";
import {isNull} from "util";

@Component({
  selector: 'app-place',
  templateUrl: './place.component.html',
  styleUrls: ['./place.component.scss']
})

export class PlaceComponent implements OnInit {
  public onlyMine: boolean = false;
  public minCost: number = 0;
  public maxCost: number = Infinity;
  public minSpace: number = 0;
  public maxSpace: number = Infinity;

  public mineOpts = [false, true];

  public places: Place[];
  public filtredPlaces: Place[];
  public currentPlace: Place;
  public currentId: number;
  private baseUrl = "/api/places";

  constructor(private http: HttpClient) {
    this.places = [];
    this.filtredPlaces = [];
    this.currentId = -1;
  }

  ngOnInit() {
    this.http.get(COMMON_ADDRESS + this.baseUrl).subscribe(data => {
      if (data['response']['status'] === 'success') {
        const pl = data['response'];
        for (const item of pl) {
          const p = new Place(item);
          this.places.push(p);
        }
      }
    });
    // this.places.push({landlord: "user", costs: 100, square: 19, address: "address 1", room_name: "room 1"});
    // this.places.push({landlord: "user1", costs: 123, square: 15, address: "address 2", room_name: "room 2"});

    this.filterPlaces();

    if (this.filtredPlaces.length > 0) {
      this.currentId = 0;
      this.currentPlace = this.filtredPlaces[this.currentId];
    } else {
      this.currentId = -1;
      this.currentPlace = new Place({landlord: "", costs: "", square: 0, address: "", room_name: ""});
    }
  }

  notShowPrev() {
    return this.filtredPlaces.length === 0 || this.currentId === 0;
  }

  notShowNext() {
    return  this.filtredPlaces.length === 0 || this.currentId === this.filtredPlaces.length - 1;
  }

  toPrev() {
    this.currentId -= 1;
    this.currentPlace = this.filtredPlaces[this.currentId];
  }

  toNext() {
    this.currentId += 1;
    this.currentPlace = this.filtredPlaces[this.currentId];
  }

  filterPlaces() {
    this.filtredPlaces.length = 0;
    for (const item of this.places) {
      if (((this.onlyMine && item.landlord === this.currUser()) || !this.onlyMine) &&
        ((this.minCost == 0 ) || item.costs >= this.minCost) &&
        ((this.maxCost == Infinity ) || item.costs <= this.maxCost) &&
        ((this.minSpace == 0 ) || item.square >= this.minSpace) &&
        ((this.maxSpace == Infinity ) || item.square <= this.maxSpace)
      ){
        this.filtredPlaces.push(item);
      }
    }
    this.currentId = 0;
    this.currentPlace = this.filtredPlaces[this.currentId];
  }



  currUser() {
    const cookie = (this.getCookie("f_c"));
    if (!isNull(cookie)) {
      console.log(1);
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

  filtersValid() {
    return (this.minCost >= 0) &&
      (this.maxCost >= 0) &&
      (this.minCost <= this.maxCost) &&
      (this.minSpace >= 0) &&
      (this.maxSpace >= 0) &&
      (this.minSpace <= this.maxSpace)
  }
}
