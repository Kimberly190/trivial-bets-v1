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
  bets;
  laneData;
  NUM_LANES = 7;

  constructor(
    private tempService: TempService
  ) { }

  ngOnInit() {
    this.tempService.getAnswersAndBets().subscribe(
      data => {
        console.log("got game data:");
        console.log(data);
        this.gameData = data;

        this.getAnswers1();
      },
      error => {
        console.log("error getting game data.");
        console.log(error);
      }
    );
  }

  distributeAnswers(playerAnswers): any[] {
    let laneResults = [];

    let sorted = playerAnswers.filter(Boolean).sort((a, b) => { return a.answer - b.answer; });

    //TODO handle case of even answers
    let startLane = (this.NUM_LANES - sorted.length) / 2 + 1;

    let payRates = [6, 5, 4, 3, 2, 3, 4, 5];
    let laneData;
    for (let i = 0; i < this.NUM_LANES + 1; i++) {
      if (i >= startLane && i < startLane + sorted.length) {
        laneData = sorted[i - startLane];
      } else {
        laneData = { };
      }

      laneData.lane = i;
      laneData.bets = [];
      laneData.payRate = payRates[i];
      laneResults.push(laneData);
    }

    return laneResults;
  }

  getAnswers1() {
    this.players = this.gameData[0].players;
    this.bets = this.gameData[0].bets;
    this.laneData = this.distributeAnswers(this.players);
  }

  getAnswers2() {
    this.players = this.gameData[1].players;
    this.bets = this.gameData[1].bets;
    this.laneData = this.distributeAnswers(this.players);
  }

  setBets() {
    for (let i = 0; i < this.bets.length; i++)
    {
      let bet = this.bets[i];
      let laneDatum = this.laneData.find(a => a.lane == bet.lane);

      if (laneDatum) {
        laneDatum.bets.push(bet);
      } else {
        console.log('could not find lane for bet ' + bet.amount + ' lane ' + bet.lane);
      }
    }
  }
}