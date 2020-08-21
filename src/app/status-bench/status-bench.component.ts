import { Component, OnInit, Input } from '@angular/core';

import { TempService } from '../temp.service';

@Component({
  selector: 'app-status-bench',
  templateUrl: './status-bench.component.html',
  styleUrls: ['./status-bench.component.css']
})
export class StatusBenchComponent implements OnInit {

  playerData;

  constructor(
    private tempService: TempService
  ) { }

  ngOnInit() {
    this.tempService.getAnswersAndBets().subscribe(
      data => {
        //console.log("got player data: ", data);
        this.playerData = data[0]["players"];
        //console.log("status playerData: ", this.playerData);
      },
      error => {
        console.log("error getting player data: ", error);
      }
    );
  }

}