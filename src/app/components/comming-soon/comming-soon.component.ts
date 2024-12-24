import { Component, OnInit } from '@angular/core';
import { AppSettings } from '../../app.setting';

@Component({
  selector: 'app-comming-soon',
  templateUrl: './comming-soon.component.html',
  styleUrls: ['./comming-soon.component.css']
})
export class CommingSoonComponent implements OnInit {
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  constructor() { }

  ngOnInit() {
  }

}
