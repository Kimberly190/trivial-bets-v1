import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import * as models from './models';

@Injectable()
export class GameApiService {

  NUM_LANES = 8;
  payRates = [6, 5, 4, 3, 2, 3, 4, 5];

  gameRoom: models.GameRoom;
  player: models.Player;
  players: models.Player[] = [];
  currentQAnswers: models.Answer[] = [];

  constructor(
    private http: HttpClient
  ) { }

  createGame(): Observable<models.GameRoom> {
    //TODO this.http.post(gameRoom);
    //TODO this.http.get(gameRoomId);
    this.gameRoom = {
      id: 1
    };
    return of(this.gameRoom);
  }

  createPlayer(name: string, isHost: boolean): void {
    //TODO: use optional properties in interfaces to facilitate DTO?
    // let player: any = {
    //   name: name,
    //   isHost: isHost
    // };
    //TODO this.http.post(player);
    this.player = this.players[0];
  }

  //TODO adjust to function by gameRoomId
  getPlayers(questionId: number): Observable<models.Player[]> {
    this.players.length = 0;

    this.getMockDataSource(questionId).subscribe(
      data => {
        data["players"].forEach(p => this.players.push(p));
      },
      error => {
        console.log("error getting player data in game api service: ", error);
      }
    );

    return of(this.players);
  }

  createQuestion() {
    //TODO
  }

  createAnswer() {
    //TODO
  }

  getAnswersForQuestion(questionId: number) {
    //TODO replace
    return this.getMockDataSource(questionId);
  }

  createBet() {
    //TODO
  }

  getBetsForQuestion(questionId: number) {
    //TODO replace
    return this.getMockDataSource(questionId);
  }

  //TODO: updateQuestion, getResultsForQuestion, etc.

  getMockDataSource(questionId) {
    switch (questionId) {
      case 1:
        return this.http.get('/assets/mock_data_g1q1.json');
      case 2:
        return this.http.get('/assets/mock_data_g1q2.json');
      case 3:
        return this.http.get('/assets/mock_data_g1q3.json');
      case 4:
        return this.http.get('/assets/mock_data_g1q4.json');
      case 5:
        return this.http.get('/assets/mock_data_g2q1.json');
      case 6:
        return this.http.get('/assets/mock_data_g3q1.json');
      default:
        return;
    }
  }

  //TODO typed return
  //TODO can this be simplified? skip param players?
  // Precondition: these are player answers only
  distributeAnswers(answers, players): any[] {
    //TODO remove? or remove param?
    this.players = players;
    
    let laneResults = [];

    //TODO is this the best approach?  can do this elsewhere, and avoid double-iteration?
    for (let i = 0; i < answers.length; i++) {
      if (answers[i].playerId) { // It is not the default answer
        var player = players.find(p => p.id === answers[i].playerId);
        // Copy player name and playerNumber to answer to simplify display logic
        answers[i].name = player.name;
        answers[i].playerNumber = player.playerNumber;
      }
    }

    // .filter to work on a copy - TODO is this necessary?
    let sorted = answers.filter(Boolean).sort((a, b) => { return a.guess - b.guess; });

    for (let i = 0; i < sorted.length; i++) {

      // change each to an array, for now with single entry...
      let current = [sorted[i]];

      let matches = sorted.slice(i + 1).filter(x => x.guess === current[0].guess);
      if (matches) {
        matches.forEach(m => {
          // ...append any identical answers then remove from outer array
          current.push(m);
          delete sorted[sorted.indexOf(m)];
        });
        //TODO simplify this v
        // collapse deleted items before iterating; account for non-array-ified entries
        sorted = sorted.filter(item => item != null && (item.length == undefined || item.length > 0));
      }

      sorted[i] = current;
    }

    // Skip middle lane if even number of distinct answers; indicate with empty array
    if (sorted.length % 2 == 0) {
      sorted.splice(sorted.length  / 2, 0, []);
    }

    //TODO check this formula  (-1 +1 ?) //TODO simplify?
    let startLane = Math.floor((this.NUM_LANES - 1 - sorted.length) / 2) + 1;
    for (let i = 0; i < this.NUM_LANES; i++) {

      //TODO model type
      let laneData = {
       lane: i,
        answers: [],
        bets: [],
        payRate: this.payRates[i],
      };
      if (i >= startLane && i < startLane + sorted.length) {
        laneData.answers.push(...sorted[i - startLane]);
      }

      laneResults.push(laneData);
    }

    return laneResults;
  }

  setBets(laneData, bets) {
    for (let i = 0; i < bets.length; i++)
    {
      // Copy playerNumber to bet to simplify display logic
      let player = this.players.find(p => p.id == bets[i].playerId);
      bets[i].playerNumber = player.playerNumber;

      // Assign bet to lane based on answerIds
      let laneDatum = laneData.find(d => (d.answers.find(a => a.id === bets[i].answerId)));
      if (!laneDatum) {
        // It is the 'default' lane
        //TODO verify bets are not getting lost here
        laneDatum = laneData.find(d => d.lane === 0);
      }
      
      laneDatum.bets.push(bets[i]);
    }
  }
}