import {Component, OnInit} from "@angular/core";
import {Place} from "../datamodels/place";
import {COMMON_ADDRESS} from "../datamodels/common_address";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-place',
  templateUrl: './place.component.html',
  styleUrls: ['./place.component.scss']
})

export class PlaceComponent implements OnInit {
  public places: Place[];
  public filtredPlaces: Place[];
  public currentPlace: Place;
  private baseUrl = "/api/places";

  constructor(private http: HttpClient) {
    this.places = [];
    this.filtredPlaces = [];
    this.places.push({id:1, date: "", cost: 10, space:20, host:0, event:0, free:true});
  }

  ngOnInit() {
    this.http.get(COMMON_ADDRESS + this.baseUrl).subscribe(data => {
      if (data['response']['status'] === 'success') {
        const pl = data['response'];
        for (const item of pl) {
          const p = new Place(item);
          this.places.push(p);
          this.filtredPlaces.push(p);
        }
      }
    })
  }

}
