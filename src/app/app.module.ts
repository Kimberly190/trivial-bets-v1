import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { GameBoardComponent } from './game-board/game-board.component';
import { LaneComponent } from './lane/lane.component';
import { BetComponent } from './bet/bet.component';

import { TempService } from './temp.service';

@NgModule({
  imports:      [ BrowserModule, FormsModule, HttpClientModule,
    RouterModule.forRoot([
      { path: '', component: GameBoardComponent }
    ]) ],
  declarations: [ AppComponent, HeaderComponent, GameBoardComponent, LaneComponent, BetComponent ],
  bootstrap:    [ AppComponent ],
  providers: [TempService]
})
export class AppModule { }
