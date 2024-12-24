import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppSettings } from './../../app.setting';
import { Http } from '@angular/http';
import { ISubscription } from 'rxjs/Subscription';
import { CartService } from '../../services/cart.service';
@Component({
  selector: 'app-payment-page',
  templateUrl: './payment.component.html',
  styleUrls: [],
  providers: [CartService]
})
export class PaymentContentComponent implements OnInit, OnDestroy {
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  SiteUrl = AppSettings.SITE_ENDPOINT;
  paymentMessage: string;
  paymentId: string;
  paymentDetails = [];
  host: string = AppSettings.API_ENDPOINT;
  isPaymentSuccess: boolean;
  isLoading: boolean;
  getPayDetailsReq: ISubscription;
  queryParamsReq;
  constructor(
    private router: Router,
    private http: Http,
    private activeRoute: ActivatedRoute,
    private cartService: CartService
  ) {}
  ngOnInit() {
    this.isLoading = true;
    this.queryParamsReq = this.activeRoute.queryParams.subscribe((params: Params) => {
      this.paymentMessage = params.error_message ? params.error_message : '';
      this.paymentId = params.id ? params.id : params.agreement_id ? params.agreement_id : null;
      if (params['status']) {
        if (params['status'] == 200) {
          if (!this.paymentId) {
            this.router.navigateByUrl('/404');
            return;
          }
          this.getPaymentDetail();
          this.isPaymentSuccess = true;
        } else {
          this.isPaymentSuccess = false;
          this.isLoading = false;
        }
      } else {
        this.router.navigateByUrl('/404');
        return;
      }
      if (params['type'] && params['type'] == '3') {
        this.cartService.destroy();
      }
    });
  }
  getPaymentDetail() {
    this.getPayDetailsReq = this.http
      .get(this.host + 'webservices/paymentDetails?id=' + this.paymentId)
      .subscribe(data => {
        let res = data.json();
        if (res.status) {
          switch (res.status) {
            case 200:
              this.paymentDetails = res.data ? res.data : [];
              this.isLoading = false;
              break;
            default:
              this.router.navigateByUrl('404');
              break;
          }
        } else {
          this.router.navigateByUrl('404');
        }
      });
  }
  ngOnDestroy() {
    if (this.getPayDetailsReq) {
      this.getPayDetailsReq.unsubscribe();
    }
    if (this.queryParamsReq) {
      this.queryParamsReq.unsubscribe();
    }
  }
}
