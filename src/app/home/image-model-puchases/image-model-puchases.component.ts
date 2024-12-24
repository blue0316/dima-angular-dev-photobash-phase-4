import { AppSettings } from './../../app.setting';
import { ISubscription } from 'rxjs/Subscription';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonSevice } from '../../services/common.service';
@Component({
  selector: 'app-image-model-puchases',
  templateUrl: './image-model-puchases.component.html',
  styleUrls: ['./image-model-puchases.component.css'],
  providers: [CommonSevice]
})
export class ImageModelPuchasesComponent implements OnInit, OnDestroy {
  isLoading: boolean;
  getHistorySubscription: ISubscription;
  items: any[];
  ImgPathser = AppSettings.SERVER_IMG_PATH;
  ImgPath = AppSettings.IMG_ENDPOIT
  constructor(private comService: CommonSevice) {}
  ngOnInit() {
    this.isLoading = true;
    this.items = [];
    this.getHistory();
  }
  getHistory() {
    this.getHistorySubscription = this.comService
      .get('webservices/getModelAndImagePurchaseHistory', {
        token: localStorage.getItem('token')
      })
      .subscribe(data => {
        if (data.status == 200) {
          this.items = data.data;
        } else {
          this.items = [];
        }
        this.isLoading = false;
      });
  }
  ngOnDestroy() {
    if (this.getHistorySubscription) {
      this.getHistorySubscription.unsubscribe();
    }
  }
}
