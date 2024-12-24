import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CommonSevice } from '../../services/common.service';
import { WindowSevice } from '../../services/window.service';
import { AppSettings } from './../../app.setting';
import { HeaderComponent } from '../../components/header/header.component';
import { ISubscription } from 'rxjs/Subscription';
@Component({
  selector: 'app-verify-request',
  templateUrl: './verify-request.component.html',
  styleUrls: ['./verify-request.component.css'],
  providers: [CommonSevice, WindowSevice]
})
export class VerifyRequestComponent implements OnInit, OnDestroy {
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  importParams: Object = {};
  isImportConfirm: boolean;
  importMessage: string = null;
  user: any;
  confimImportReq: ISubscription;
  queryParamReq;

  @ViewChild(HeaderComponent) $header: HeaderComponent;
  constructor(
    private _router: Router,
    private comServ: CommonSevice,
    private winServ: WindowSevice,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {
    this.titleService.setTitle('Import Request');
    this.isImportConfirm = true;
    this.user = {};
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      if (params.confirm && params.imp && params.verToken && params.user) {
        this.importParams = {
          confirm: params.confirm,
          imp: params.imp,
          verToken: params.verToken,
          oldUser: params.user
        };
        this.isImportConfirm = false;
        this.verifyImportReq();
      } else {
        this._router.navigate(['/404']);
      }
    });
  }
  checkLogin(isLoggedIn: boolean) {
    // if (isLoggedIn && this.winServ.getLocalItem('token')) {
    //   this.user = JSON.parse(this.winServ.getLocalItem('userData'));
    //   this.verifyImportReq();
    // } else {
    //   this._router.navigate(['/404']);
    // }
  }
  verifyImportReq() {
    // this.importParams['currentUser'] = this.user['id'];
    this.comServ.post('webservices/confirmImportRequest', this.importParams).subscribe(data => {
      if (data.status == 200) {
        this.importMessage = data.message;
      } else {
        this._router.navigate(['/404']);
      }
    });
  }
  ngOnDestroy() {
    if (this.confimImportReq) {
      this.confimImportReq.unsubscribe();
    }
    if (this.queryParamReq) {
      this.queryParamReq.unsubscribe();
    }
  }
}
