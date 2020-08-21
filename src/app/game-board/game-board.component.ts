import { Component, OnInit } from '@angular/core';
//import { NgZone } from '@angular/core';

import { TempService } from '../temp.service';

import { LaneComponent } from '../lane/lane.component';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css']
})
export class GameBoardComponent implements OnInit {

  //TODO: implement models
  gameData;
  players;
  laneData;
  currentQuestion = -1;

  constructor(
    private tempService: TempService
  ) { }

  ngOnInit() {
    this.tempService.getAnswersAndBets().subscribe(
      data => {
        console.log("got game data: ", data);
        this.gameData = data;

        //TODO support initial state
        this.getAnswers();
      },
      error => {
        console.log("error getting game data: ", error);
      }
    );
  }

  getAnswers() {
    this.currentQuestion++;
    //TODO remove / change to 7 question max?
    if (this.currentQuestion >= this.gameData.length) {
      this.currentQuestion = 0;
    }
    this.players = this.gameData[this.currentQuestion].players;
    this.laneData = this.tempService.distributeAnswers(this.players);
  }

  setBets() {
    //TODO review separation of concerns here
    this.tempService.setBets(this.laneData, this.gameData[this.currentQuestion].bets);
  }
}