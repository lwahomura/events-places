export class Event {

  constructor(jsonData) {
    this.event_date = jsonData.event_date;
    this.room_name = jsonData.room_name;
    this.event_name = jsonData.event_name;
    this.organizer = jsonData.organizer;
    this.event_costs = jsonData.event_costs;
  }

  public event_date: string;
  public room_name: string;
  public event_name: string;
  public organizer: string;
  public event_costs: number;
}
