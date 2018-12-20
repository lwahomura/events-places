export class Place {

  constructor(jsonData) {
    this.square = jsonData.square;
    this.costs = jsonData.costs;
    this.address = jsonData.address;
    this.landlord = jsonData.landlord;
    this.room_name = jsonData.room_name;
    this.full_cost = this.square * this.costs;
  }

  public square: number;
  public costs: number;
  public address: string;
  public landlord: string;
  public room_name: string;
  public full_cost: number;
}
