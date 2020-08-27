//TODO: can this wrapper be removed now that state-director exists?  else refactor some back into here?

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { GameApiService } from '../game-api.service';

import * as models from '../models';

import { LaneComponent } from '../lane/lane.component';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css']
})
export class GameBoardComponent implements OnInit {

  //TODO: implement model
  @Input() laneData;
  @Output() bet = new EventEmitter<models.Bet>();

  constructor(
    private gameApiService: GameApiService
  ) { }

  ngOnInit() {
    
  }

  onBet(bet: models.Bet) {
    // Forward event to state-director
    this.bet.emit(bet);
  }
  
}