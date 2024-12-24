import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Http, Headers, RequestOptions } from '@angular/http';
import { AppSettings } from './../../app.setting';
import { WindowSevice } from './../../services/window.service';
import { HeaderComponent } from '../../components/header/header.component';
import { ISubscription } from 'rxjs/Subscription';
@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: [],
  providers: [WindowSevice],
})
export class SupportComponent implements OnDestroy, OnInit {
  isSupportFormMessage: boolean;
  succesErrorMessage: string;
  messageClass: string;
  supportError: string;
  support: Support;
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  private host: string = AppSettings.API_ENDPOINT;
  private SiteUrl: string = AppSettings.SITE_ENDPOINT;
  req: ISubscription;
  subjects = [
    {
      id: 2,
      subject: 'General Inquiries',
    },
    {
      id: 1,
      subject: 'Legal Terms & Conditions',
    },
    {
      id: 3,
      subject: 'Photo Pack Suggestion',
    },
  ];
  userData: any;
  sendingRequest: boolean;
  sendingImportRequest: boolean;
  @ViewChild(HeaderComponent) $header: HeaderComponent;
  constructor(
    private winServ: WindowSevice,
    private http: Http,
    private titleService: Title,
  ) {
    this.titleService.setTitle('Contact Us');
  }
  ngOnInit() {
    this.support = {
      first_name: '',
      last_name: '',
      subject: this.subjects[0].id,
      message: '',
      email: '',
    };
  }
  submitData(contactForm: NgForm) {
    this.isSupportFormMessage = true;
    this.messageClass = '';
    this.sendingRequest = true;
    let headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
    });
    let options = new RequestOptions({ headers: headers });
    this.req = this.http
      .post(
        this.host + 'webservices/support',
        JSON.stringify(this.support),
        options,
      )
      .map(res => res.json())
      .subscribe(data => {
        if (data.status === 200) {
          // this.messageClass = 'alert alert-success';
          this.succesErrorMessage = data.message;
          // this.support.message = '';
          contactForm.controls['message'].reset();
          // contactForm.resetForm();
          this.$header.headerNotifyalert('Success!', data.message, 'success');
        } else {
          // this.succesErrorMessage = data.error_message;
          this.messageClass = 'alert alert-danger';
          this.supportError = data.error_message;
          this.$header.headerNotifyalert('Error!', data.error_message, 'error');
        }
        this.sendingRequest = false;
        setTimeout(() => {
          this.messageClass = null;
          this.succesErrorMessage = null;
          this.supportError = null;
        }, 5000);
      });
  }
  checkLogin(isLoggedIn: boolean) {
    if (isLoggedIn) {
      if (
        this.winServ.isLocalStoragSupported() &&
        this.winServ.getLocalItem('userData')
      ) {
        this.userData = JSON.parse(this.winServ.getLocalItem('userData'));
        this.support.first_name = this.userData.first_name;
        this.support.last_name = this.userData.last_name;
        this.support.email = this.userData.email;
      } else {
        this.userData = null;
      }
    } else {
      this.userData = null;
    }
  }
  ngOnDestroy() {
    if (this.req) {
      this.req.unsubscribe();
    }
  }
}
interface Support {
  first_name: string;
  last_name: string;
  subject: number;
  message: string;
  email: string;
}
