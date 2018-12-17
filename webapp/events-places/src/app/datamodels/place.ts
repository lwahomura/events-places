export class Place {

  constructor(jsonData) {
    this.square = jsonData.square;
    this.costs = jsonData.costs;
    this.address = jsonData.address;
    this.landlord = jsonData.landlord;
    this.room_name = jsonData.room_name;

  }

  public square: number;
  public costs: number;
  public address: string;
  public landlord: string;
  public room_name: string;
}
