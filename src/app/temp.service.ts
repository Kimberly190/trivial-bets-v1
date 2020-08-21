import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class TempService {

  getAnswersAndBets() {
    return this.http.get('/assets/bet_schemes.json');
  }

  NUM_LANES = 8;

  constructor(
    private http: HttpClient
  ) { }

  distributeAnswers(playerAnswers): any[] {
    let laneResults = [];

    // .filter to work on a copy - TODO is this necessary?
    let sorted = playerAnswers.filter(Boolean).sort((a, b) => { return a.answer - b.answer; });

    //TODO handle case of duplicate answers!
    //TODO efficiency?
    for (let i = 0; i < sorted.length; i++) {
      let current = sorted[i];
      let matches = sorted.slice(0, i).concat(sorted.slice(i + 1)).filter(x => x.answer === current.answer);
      if (matches) {
        matches.forEach(m => {
          current.name += ", " + m.name;
          current.player_id = 0;
          delete sorted[sorted.indexOf(m)];
        });
        sorted = sorted.filter(Boolean);
      }
    }

    // Skip middle lane if even number of answers
    if (sorted.length % 2 == 0) {
      sorted = sorted.slice(0, sorted.length / 2).concat({ }).concat(sorted.slice(sorted.length / 2));
    }

    //TODO check this formula  (-1 +1 ?)
    let startLane = (this.NUM_LANES - 1 - sorted.length) / 2 + 1;

    let payRates = [6, 5, 4, 3, 2, 3, 4, 5];
    let laneData;
    for (let i = 0; i < this.NUM_LANES; i++) {

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

  setBets(laneData, bets) {
    for (let i = 0; i < bets.length; i++)
    {
      let laneDatum = laneData.find(a => a.lane == bets[i].lane);

      if (laneDatum) {
        laneDatum.bets.push(bets[i]);
      } else {
        console.log('could not find lane for bet ' + bets[i].amount + ' lane ' + bets[i].lane);
      }
    }
  }
}