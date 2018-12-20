import {Component, DoCheck, OnInit} from "@angular/core";
import {Place} from "../datamodels/place";
import {COMMON_ADDRESS} from "../datamodels/common_address";
import {HttpClient} from "@angular/common/http";
import {isNull} from "util";
import {HttpHeaders} from "@angular/common/http";

@Component({
  selector: 'app-place',
  templateUrl: './place.component.html',
  styleUrls: ['./place.component.scss']
})

export class PlaceComponent implements OnInit, DoCheck {
  public openCP: boolean = false;
  public openUP: boolean = false;
  public bindingEvent: boolean = false;
  public gotted: boolean = false;

  public onlyMine: boolean = false;
  public placeName: string = "";
  public placeAddress: string = "";
  public minCost: number = 0;
  public maxCost: number = Infinity;
  public minSpace: number = 0;
  public maxSpace: number = Infinity;

  public mineOpts = [false, true];

  public newPlace: Place;
  public places: Place[];
  public filtredPlaces: Place[];
  public currentPlace: Place;
  public updatePlace: Place;
  public currentId: number;
  private baseUrl = "/api/places";
  private updateUrl = "/api/placesupdate";

  private headers: HttpHeaders = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});

  constructor(private http: HttpClient) {
    this.places = [];
    this.filtredPlaces = [];
    this.currentId = -1;
    this.newPlace = new Place({landlord: this.currUser(), costs: 0, square: 0, address: "", room_name: ""});
    this.currentPlace = new Place({landlord: "", costs: 0, square: 0, address: "", room_name: ""});
    this.updatePlace = new Place({landlord: "", costs: 0, square: 0, address: "", room_name: ""});
  }

  createEvent() {
    this.bindingEvent = true;
  }

  update() {
    this.updatePlace.costs = this.currentPlace.costs;
    this.updatePlace.address = this.currentPlace.address;
    this.updatePlace.room_name = this.currentPlace.room_name;
    this.updatePlace.square = this.currentPlace.square;
    this.updatePlace.landlord = this.currentPlace.landlord;
    this.openUP = true;
  }

  stopUpdating() {
    this.openUP = false;
  }

  canUpdate() {
    return this.currentPlace.square != this.updatePlace.square ||
      this.currentPlace.room_name != this.updatePlace.room_name ||
      this.currentPlace.address != this.updatePlace.address ||
      this.currentPlace.costs != this.updatePlace.costs
  }

  updateThisPlace() {
    console.log(this.updatePlace);
    const params = new URLSearchParams();
    params.set('square', this.updatePlace.square.toString());
    params.set('costs', this.updatePlace.costs.toString());
    params.set('address', this.updatePlace.address);
    params.set('room_name', this.updatePlace.room_name);
    params.set('landlord', this.updatePlace.landlord);
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


  create() {
    this.openCP = true;
  }

  stopCreating() {
    this.newPlace = new Place({landlord: this.currUser(), costs: "", square: 0, address: "", room_name: ""});
    this.openCP = false;
  }

  canCreate() {
    return this.newPlace.square > 0 && this.newPlace.costs > 0 && this.newPlace.address.length > 0 &&
      this.newPlace.room_name.length > 0 && this.currUser().length > 0;
  }

  createPlace() {
    const params = new URLSearchParams();
    params.set('square', this.newPlace.square.toString());
    params.set('costs', this.newPlace.costs.toString());
    params.set('address', this.newPlace.address);
    params.set('room_name', this.newPlace.room_name);
    params.set('creator', this.currUser());
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

  canPressCreateEvent() {
    return this.currType() == '0' && this.currentId != -1;
  }

  canPressUpdate() {
    return this.currType() == '2' && this.currentId != -1 && !this.openUP;
  }

  canPressUpdateSave() {
    return this.currType() == '2' && this.currentId != -1 && this.openUP;
  }

  canPressCreate() {
    return !this.openCP && this.currType() == '1';
  }

  canPressSave() {
    return this.openCP && this.currType() == '1';
  }

  formsDisabled() {
    return this.currType() != "2" || this.currentId == -1 || !this.openUP;
  }

  ngOnInit() {
    this.http.get(COMMON_ADDRESS + this.baseUrl).subscribe(data => {
      if (data['status'] === 'success') {
        const pl = data['response'];
        for (const item of pl) {
          const p = new Place(item);
          this.places.push(p);
        }
      }
      this.gotted = true;
    }, error => {
      this.gotted = true;
    });
  }

  ngDoCheck() {
    if (this.gotted) {
      this.gotted = false;

      this.filterPlaces();

      if (this.filtredPlaces.length > 0) {
        this.currentId = 0;
        this.currentPlace = this.filtredPlaces[this.currentId];
      } else {
        this.currentId = -1;
        this.currentPlace = new Place({landlord: "", costs: "", square: 0, address: "", room_name: ""});
      }
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
    const nameRegexp = new RegExp(this.placeName);
    const addressRegexp = new RegExp(this.placeAddress);
    this.filtredPlaces.length = 0;
    for (const item of this.places) {
      if (((this.onlyMine && item.landlord === this.currUser()) || !this.onlyMine) &&
        ((this.minCost == 0 ) || item.costs >= this.minCost) &&
        ((this.maxCost == Infinity ) || item.costs <= this.maxCost) &&
        ((this.minSpace == 0 ) || item.square >= this.minSpace) &&
        ((this.maxSpace == Infinity ) || item.square <= this.maxSpace) &&
        (nameRegexp.test(item.room_name) && addressRegexp.test(item.address))
      ){
        this.filtredPlaces.push(item);
      }
    }
    if (this.filtredPlaces.length > 0) {
      this.currentId = 0;
      this.currentPlace = this.filtredPlaces[this.currentId];
    } else {
      this.currentId = -1;
      this.currentPlace = new Place({landlord: "", costs: "", square: 0, address: "", room_name: ""});
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

  filtersValid() {
    return (this.minCost >= 0) &&
      (this.maxCost >= 0) &&
      (this.minCost <= this.maxCost) &&
      (this.minSpace >= 0) &&
      (this.maxSpace >= 0) &&
      (this.minSpace <= this.maxSpace)
  }
}
