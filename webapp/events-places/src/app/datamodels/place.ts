export class Place {

  constructor(jsonData) {
    this.id = jsonData.id;
    this.date = jsonData.date;
    this.cost = jsonData.cost;
    this.space = jsonData.space;
    this.host = jsonData.host;
    this.event = jsonData.event;
    this.free = jsonData.free;
  }

  public id: number;
  public date: string;
  public cost: number;
  public space: number;
  public host: number;
  public event: number;
  public free: boolean;
}
