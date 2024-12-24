import { Component, OnInit, OnDestroy, Input } from '@angular/core';

@Component({
  selector: 'app-kits-grid',
  templateUrl: './kits-grid.component.html',
  styleUrls: ['./kits-grid.component.css']
})
export class KitsGridComponent implements OnInit, OnDestroy {
  @Input('kitList') kitList: any[];
  @Input('isLoading') isLoading: boolean;
  isLoggedIn: boolean;
  constructor() { }

  ngOnInit() {
  }
  ngOnDestroy(){

  }
}
