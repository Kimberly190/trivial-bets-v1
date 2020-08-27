import { Component, OnInit, HostBinding } from '@angular/core';

import { GameApiService } from '../game-api.service';

import * as models from '../models';

@Component({
  selector: 'app-state-director',
  templateUrl: './state-director.component.html',
  styleUrls: ['./state-director.component.css']
})
export class StateDirectorComponent implements OnInit {

  DEFAULT_SCORE = 2;
  DEFAULT_ANSWER = -1;
  MAX_QUESTION = 7;

  PAGE_NUM_WELCOME = 1;
  PAGE_NUM_NEW_GAME = 2;
  PAGE_NUM_WAITING = 3;
  PAGE_NUM_ANSWER_Q = 4;
  PAGE_NUM_SHOW_A = 5;
  PAGE_NUM_BET = 6;
  PAGE_NUM_SHOW_BETS = 7;
  PAGE_NUM_SHOWTIME = 8;
  PAGE_NUM_WINNING_G = 9;
  PAGE_NUM_SCORES = 10;
  PAGE_NUM_FINAL = 11;

  //TODO check optional interface properties
  //TODO componentize dependent UI pieces to avoid this innitialization
  // Initialize editable model types with defaults to enable two-way data binding.
  gameRoom: models.GameRoom = { id: undefined };
  player: models.Player = { id: undefined, playerNumber: undefined, name: undefined, isHost: false, gameRoomId: undefined, score: this.DEFAULT_SCORE };
  question: models.Question = { id: undefined, gameRoomId: undefined, correctAnswer: undefined };
  answer: models.Answer = { id: undefined, guess: undefined, playerId: undefined, questionId: undefined };
  bet: models.Bet = { id: undefined, amount: undefined, payout: undefined, playerId: undefined, answerId: undefined };
  
  allAnswers: models.Answer[];
  allResults: models.Result[];
  winningGuesses: models.Result[] = [];
  otherResults: models.Result[] = [];

  defaultAnswer: models.Answer;

  get betAnswerValue() : number {
    return (this.allAnswers && this.bet)
      ? (this.allAnswers.find(a => a.id == this.bet.answerId) || { guess: undefined }).guess
      : undefined;
  }

  get players() : models.Player[] { return this.gameApiService.players; }

  // State properties
  questionNumber: number = 0;
  //TODO contrast with http interceptor for loading solution
  @HostBinding('class.wait') loading: boolean = false;
  showGameBoard: boolean = false;
  laneData: any; //TODO
  betsPlaced: number = 0;
  page: number;

  constructor(
    private gameApiService: GameApiService
  ) { }

  ngOnInit() {
    this.page = this.PAGE_NUM_WELCOME;
  }

  hostNewGame() {
    this.loading = true;

    this.player.isHost = true;
    this.gameApiService.createGame().subscribe(
      (data: models.GameRoom) => {
        this.gameRoom = data;
        //TODO can shortcut?
        this.player.gameRoomId = this.gameRoom.id;

        this.page++;
        this.loading = false;
      },
      error => {
        //TODO handle
        console.log('error creating gameRoom in state-director: ', error);
        this.loading = false;
      },
      () => {
        //TODO
      }
    );
  }

  joinGame() {
    this.page++;
  }

  //TODO review / test
  back() {
    if (this.page == this.PAGE_NUM_NEW_GAME) {
      // Reset
      this.player.isHost = false;
      this.gameRoom.id = undefined;
    }
    this.page--;
  }

  addPlayer() {
    this.loading = true;

    this.gameApiService.createPlayer(this.player).subscribe(
      (data: models.Player) => {
        this.player = data;
        this.gameRoom.id = this.player.gameRoomId;

        this.refreshPlayers();

        this.page++;
        this.loading = false;
      },
      error => {
        //TODO handle
        console.log('error creating player in state-director: ', error);
        this.loading = false;
      },
      () => {
        //TODO
      }
    );

  }

  refreshPlayers() {
    //TODO review / test: update players to refresh status bench
    //TODO: set polling with timeout
    this.gameApiService.getPlayers(this.gameRoom.id);
  }

  nextQuestion() {
    this.loading = true;

    if (this.questionNumber == 0) {
      this.refreshPlayers();
    }

    //TODO: PUT flag on gameRoom to block late joiners?

    if (this.player.isHost) {
      // Host creates the question...
      //TODO persist question number?
      this.gameApiService.createQuestion(this.gameRoom.id).subscribe(
        (data: models.Question) => {
          this.question = data;
          this.answer.questionId = this.question.id;
          this.answer.playerId = this.player.id;

          // Also create the 'default' answer for the question.  No dependent UI updates.
          this.gameApiService.createAnswer(
            {
              id: undefined,
              guess: this.DEFAULT_ANSWER,
              playerId: undefined,
              questionId: this.question.id
            }
          ).subscribe(
            data => {
              //TODO
            },
            error => {
              //TODO handle
              console.log('error creating default quesiton in state-director: ', error);
            },
            () => {
              //TODO
            }
          );

          this.questionNumber++; //TODO remove when data-bound?
          this.page++;
          this.loading = false;
        },
        error => {
          //TODO handle
          console.log('error creating question in state-director: ', error);
          this.loading = false;
        },
        () => {
          //TODO
        }
      );
    } else {
      // ..other players just get it.
      //TODO change to use polling with retry, delay, back-off
      //https://medium.com/angular-in-depth/retry-failed-http-requests-in-angular-f5959d486294
      this.gameApiService.getLatestQuestion(this.gameRoom.id).subscribe(
        (data: models.Question[]) => {
          //TODO update after API change (will return the one question)
          let thisGameQuestions = data.filter(q => q.gameRoomId == this.gameRoom.id);
          thisGameQuestions.sort((q1, q2) => q2.id - q1.id);
          this.question = thisGameQuestions[0];

          this.answer.questionId = this.question.id;
          this.answer.playerId = this.player.id;

          this.questionNumber++; //TODO remove when data-bound?
          this.page++;
          this.loading = false;
        },
        error => {
          //TODO handle
          console.log('error getting question in state-director: ', error);
          this.loading = false;
        },
        () => {
          //TODO
        }
      );
    }
  }

  submitAnswer() {
    this.gameApiService.createAnswer(this.answer).subscribe(
      (data: models.Answer) => {
        this.answer = data;

        //TODO get all answers & poll

        this.betsPlaced = 0;
        this.showGameBoard = true;
        this.page++;
        this.loading = false;

        //TODO test
        this.refreshAnswers();
      },
      error => {
        //TODO
        this.loading = false;
      },
      () => {
        //TODO
      }
    )
  }

  refreshAnswers() {
    this.loading = true;

    this.gameApiService.getAnswersForQuestion(this.question.id).subscribe(
      (data: models.Answer[]) => {
        this.allAnswers = data;
        this.defaultAnswer = this.allAnswers.find(a => a.guess == this.DEFAULT_ANSWER);
        let playerAnswers = this.allAnswers.filter(a => a.guess != this.DEFAULT_ANSWER);
        this.laneData = this.gameApiService.distributeAnswers(playerAnswers, this.gameApiService.players);

        this.loading = false;
      },
      error => {
        //TODO handle
        console.log('error refreshing answers in state-director: ', error);
        this.loading = false;
      },
      () => {
        //TODO
      }
    );
  }

  onBet(bet: models.Bet) {
    if (this.betsPlaced < 2) {
      //TODO: review / test - why isn't this working?
      if (bet.amount <= this.player.score) {
        this.bet = bet;
        this.bet.playerId = this.player.id;
        //TODO decrement player score by amount?  (would require persisting & updating all users...)

        if (this.bet.answerId == 0) {
          this.bet.answerId = this.defaultAnswer.id;
        }

        this.page = this.PAGE_NUM_BET;
        this.showGameBoard = false;
      } else {
        window.alert('You can\'t bet more chips than you have');
      }
    } else {
      window.alert('You can only bet two times.');
    }
  }

  submitBet() {
    this.loading = true;

    this.gameApiService.createBet(this.bet).subscribe(
      (data: models.Bet) => {
        this.bet = data;

        this.page = this.PAGE_NUM_SHOW_BETS;
        this.betsPlaced++;
        this.showGameBoard = true;

        this.loading = false;

        //TODO test
        this.refreshBets();
      },
      error => {
        //TODO handle
        console.log('error submitting bet in state-director: ', error);
      },
      () => {
        //TODO
      }
    );
  }

  refreshBets() {
    this.loading = true;

    this.gameApiService.getBetsForQuestion(this.question.id).subscribe(
      (data: models.Bet[]) => {
        var bets = data;
        this.gameApiService.setBets(this.laneData, bets);

        this.loading = false;
      },
      error => {
        //TODO handle
        console.log('error refreshing answers in state-director: ', error);
        this.loading = false;
      },
      () => {
        //TODO
      }
    );
  }

  goToResults() {
    this.page++;
    this.showGameBoard = false;
  }

  updateQuestionGetResults() {
    if (this.player.isHost) {
      // Update the question with the correct answer.
      this.loading = true;

      this.gameApiService.updateQuestion(this.question).subscribe(
        data => {
          this.loading = false;

          this.getResults();
        },
        error => {
          //TODO handle
          console.log('error updating question in state-director: ', error);
          this.loading = false;
        },
        () => {
          //TODO
        }
      );
    } else {
      this.loading = true;

      this.gameApiService.getLatestQuestion(this.gameRoom.id).subscribe(
        (data: models.Question[]) => {
          //TODO update after API change: will return just the one question
          let thisGameQuestions = data.filter(q => q.gameRoomId == this.gameRoom.id);
          thisGameQuestions.sort((q1, q2) => q2.id - q1.id);
          this.question = thisGameQuestions[0];

          this.loading = false;

          this.getResults();
        }
      )
    }
  }

  getResults() {
    this.loading = true;

    this.gameApiService.getResultsForQuestion(this.question.id).subscribe(
      (data: models.Result[]) => {

        this.allResults = data;
        this.allResults.forEach(r => {
          // Populate player and answer to simplify display logic.
          r.player = this.gameApiService.players.find(p => p.id == r.playerId);
          r.answer = this.allAnswers.find(a => a.playerId == r.playerId);
        });

        this.winningGuesses = this.allResults.filter(r => r.isWinningGuess);
        this.otherResults = this.allResults.filter(r => !r.isWinningGuess);

        this.page++;
        this.loading = false;

        if (this.player.isHost) {
          this.updateScores();
        }
      },
      error => {
        //TODO handle
        console.log('error getting results in state-director: ', error);
        this.loading = false;
      },
      () => {
        //TODO
      }
    );
  }

  updateScores() {
    for (let player of this.gameApiService.players) {
      this.loading = true;

      let playerResults = this.allResults.filter(r => r.playerId == player.id);
      playerResults.forEach(pr => player.score += pr.credit);
      
      //TODO fix score decrementing / incrementing (doesn't work unless host handles all...)
      //// Also add back the default chips.
      //player.score += this.DEFAULT_SCORE;

      this.gameApiService.updatePlayer(player).subscribe(
        data => {
          this.loading = false;
        },
        error => {
          //TODO handle
          console.log('error updating player in state-director: ', error);
          this.loading = false;
        },
        () => {
          //TODO
        }
      )
    }
  }

  getPlayerCredits() {
    this.refreshPlayers();
    this.page++;
  }

  endQuestion() {
    if (this.questionNumber == this.MAX_QUESTION) {
      this.getFinalScores();
    } else {
      // Reset.
      this.answer = { id: undefined, guess: undefined, playerId: undefined, questionId: undefined };
      this.allAnswers.length = 0;
      this.bet = { id: undefined, amount: undefined, payout: undefined, playerId: undefined, answerId: undefined };
      this.questionNumber++; //TODO remove when data-bound?
      this.page = this.PAGE_NUM_ANSWER_Q;
    }
  }

  getFinalScores() {
    this.page++;
  }

  endGame() {
    //TODO
    //?
  }

}