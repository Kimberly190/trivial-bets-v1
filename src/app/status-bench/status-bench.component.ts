import { Component, OnInit, Input } from '@angular/core';

import { GameApiService } from '../game-api.service';

import { Player } from '../models';

@Component({
  selector: 'app-status-bench',
  templateUrl: './status-bench.component.html',
  styleUrls: ['./status-bench.component.css']
})
export class StatusBenchComponent implements OnInit {

  gameRoomId: number;
  players: Player[];

  constructor(
    private gameApiService: GameApiService
  ) { }

  ngOnInit() {

    //TODO remove
    this.gameRoomId = 1;

    this.gameApiService.getPlayers(this.gameRoomId).subscribe(
      data => {
        this.players = data;
      },
      error => {
        console.log("error getting status player data: ", error);
      }
    );
  }

}