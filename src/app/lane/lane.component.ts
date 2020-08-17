import { Component, OnInit, Input } from '@angular/core';

import { BetComponent } from '../bet/bet.component';

@Component({
  selector: 'app-lane',
  templateUrl: './lane.component.html',
  styleUrls: ['./lane.component.css']
})
export class LaneComponent implements OnInit {

  @Input() laneData: any;
  @Input() bets: any;

  public get payRate(): number {
      return this.laneData.payRate;
  }

  constructor() { }

  ngOnInit() {
  }

}