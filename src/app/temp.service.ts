import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class TempService {

  getAnswersAndBets() {
    return this.http.get('/assets/bet_schemes.json');
  }

  constructor(
    private http: HttpClient
  ) { }

}