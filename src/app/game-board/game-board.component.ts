import { Component, OnInit } from '@angular/core';

import { GameApiService } from '../game-api.service';

import * as models from '../models';

import { LaneComponent } from '../lane/lane.component';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css']
})
export class GameBoardComponent implements OnInit {

  //TODO: implement models
  answers: models.Answer[];
  laneData;
  currentQuestion = 0;

  constructor(
    private gameApiService: GameApiService
  ) { }

  ngOnInit() {
    //TODO subscribe to empty answer set on initialize so that game board can be shown
  }

  //TOCHECK: https://stackoverflow.com/questions/42657380/observable-polling/42659054#42659054
  getAnswers() {
    this.currentQuestion++;
    //TODO remove / change to 7 question max
    if (this.currentQuestion > 6) {
      this.currentQuestion = 1;
    }

    //TODO remove
    this.gameApiService.getPlayers(this.currentQuestion);

    this.gameApiService.getAnswersForQuestion(this.currentQuestion).subscribe(
      data => {
        //TODO fix all this
        this.answers = data["answers"];
        var playerAnswers = this.answers.filter(a => a.guess != -1);
        this.laneData = this.gameApiService.distributeAnswers(playerAnswers, this.gameApiService.players);
      }
      //TODO error, ()
    );
  }

  setBets() {
    this.gameApiService.getBetsForQuestion(this.currentQuestion).subscribe(
      data => {
        //TODO fix all this
        var bets = data["bets"];
        this.gameApiService.setBets(this.laneData, bets);
      }
      //TODO error, ()
    );
  }
  
}