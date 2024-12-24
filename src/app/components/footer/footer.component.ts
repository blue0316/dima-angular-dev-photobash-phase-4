import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppSettings } from './../../app.setting';
import { CommonSevice } from '../../services/common.service';
import { ISubscription } from 'rxjs/Subscription';
import swal from 'sweetalert2';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: [],
  providers: [CommonSevice]
})
export class FooterComponent implements OnInit, OnDestroy {
  host: string = AppSettings.API_ENDPOINT;
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  email: string;
  errorMessage: string = null;
  currentYear: any;
  pages: any;
  fbURL: string = null;
  tweetURL: string = null;
  instaURL: string = null;
  lintURL: string = null;
  youtubeURL: string = null;
  pinURL: string = null;
  getFooterDataReq: ISubscription;
  newsletterReq: ISubscription;
  constructor(private commSer: CommonSevice){
    this.currentYear = new Date().getFullYear();
    this.getCustomPages();
  }
  ngOnInit(){}
  getCustomPages(){
    this.getFooterDataReq = this.commSer.get('webservices/getFooterData').subscribe(data=>{
      this.pages = data.data.pages;
      this.fbURL = data.data.fbURL;
      this.tweetURL = data.data.tweetURL;
      this.instaURL = data.data.instaURL;
      this.lintURL = data.data.lintURL;
      this.youtubeURL = data.data.youtubeURL;
      this.pinURL = data.data.pinURL;
    });
  }
  subscribeToNewsletter(){
    this.errorMessage = null;
    if (this.email=='') {
      this.errorMessage = 'Email field is required.';
      setTimeout(() => {
        this.errorMessage = null;
      }, 5000);
      return;
    }
    if (!this.commSer.isValidEmail(this.email)) {
      this.errorMessage = 'Email field must contain a valid email address.';
      setTimeout(() => {
        this.errorMessage = null;
      }, 5000);
      return;
    }
    this.newsletterReq = this.commSer.post('webservices/newsletterSubscription', {email: this.email}).subscribe(data=>{
      if (data.status) {
        switch (data.status) {
          case 200:
            this.notify('Success!', data.message, 'success');
            this.email = '';
            break;
          case 403:
            this.notify('Success!', data.message, 'error');
            break;
          default:
            this.notify('Success!', 'An unknown error occure', 'error');
            break;
        }
      } else {
        this.notify('Success!', 'An unknown error occure', 'error');
      }
      setTimeout(() => {
        this.errorMessage = null;
      }, 5000);
    });
  }
  notify(title, messageHTML, type) {
    return swal({
      customClass: 'notification-alert-box',
      title: title,
      html: messageHTML,
      type: type,
      // position: modalposition,
      showConfirmButton: false,
      showCloseButton: true,
      backdrop: false,
      timer: 5000,
      onOpen: () => {
        $('body').find('.notification-alert-box').parent('.swal2-container').addClass('notification-alert-box-warp swal2-bottom-right');
        $('body').find('.notification-alert-box').parent('.swal2-container').removeClass('swal2-center');
        $('body').find('.notification-alert-box').parent('.swal2-container').removeAttr('style');
        $('body').addClass('swal2-bottom-end');
      }
    });
  }
  ngOnDestroy(){
    if (this.newsletterReq) {
      this.newsletterReq.unsubscribe();
    }
    if (this.getFooterDataReq) {
      this.getFooterDataReq.unsubscribe();
    }
  }
}
