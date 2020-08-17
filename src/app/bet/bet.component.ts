import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-bet',
  templateUrl: './bet.component.html',
  styleUrls: ['./bet.component.css']
})
export class BetComponent implements OnInit {

  // @Input() player: number;
  // @Input() amount: number;
  @Input() betData: any;

  constructor() { }

  ngOnInit() {
  }

}