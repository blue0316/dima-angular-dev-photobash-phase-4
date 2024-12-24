import { Component, NgZone, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Title } from '@angular/platform-browser';
import { AppSettings } from './../../app.setting';
import { WindowSevice } from './../../services/window.service';
import * as $ from 'jquery';
import swal from 'sweetalert2';
import { CommonSevice } from '../../services/common.service';
import { HeaderComponent } from '../../components/header/header.component';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { ActivatedRoute, Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
@Component({
  selector: 'app-invoices-page',
  templateUrl: './invoice.component.html',
  styleUrls: [],
  providers: [WindowSevice, CommonSevice]
})
export class InvoiceComponent implements OnInit, OnDestroy{   
  host: string = AppSettings.API_ENDPOINT;
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  SiteUrl = AppSettings.SITE_ENDPOINT;
  AssetsUrl = AppSettings.ASSETS_URL;
  isDataLoaded: boolean;
  isUserLoggedIn: boolean;
  userData: any;
  private fragment: string;
  message: string;
  invoices: Array<any> = [];
  photobashInfo: Array<any> = [];
  invoiceReq: ISubscription;
  inter: any;
  currentId: number;
  constructor(private http: Http, private winServ: WindowSevice, private titleService: Title, private comServ: CommonSevice, private route: ActivatedRoute, private router: Router, private changeRef: ChangeDetectorRef,private ngZone: NgZone,){
    if (this.inter) {
      clearInterval(this.inter);
    }
    this.currentId = 0;
    this.message = 'Fetching Details...';
    this.inter = setInterval(() => {
      this.ngZone.run(() => {
        if (!this.changeRef['destroyed']) {
          this.changeRef.detectChanges();
        }
      })
    }, 1000);
    this.titleService.setTitle('Invoice');
  }

  ngOnInit(){
    let token = this.winServ.getLocalItem('token');
    this.isDataLoaded = false;
    this.invoiceReq = this.http.get(this.host+'webservices/invoice?token='+token).subscribe(data=>{
      let res = data.json();
      if (res.status) {
        switch (res.status) {
          case 200:
            this.invoices = (res.data) ? res.data : [];
            this.photobashInfo = (res.photobashInfo) ? res.photobashInfo : [];
            if (this.invoices.length==0) {
              this.message = 'No invoice';
            }else{
              this.isDataLoaded = true;
            }
            break;
          default:
            this.invoices = [];
            this.photobashInfo = [];
            this.message = 'No invoice';
            break;
        }
      }else{
        this.invoices = [];
        this.photobashInfo = [];
      }
    });
  }
  checkLogin(isLoggedIn: boolean){
    this.isUserLoggedIn = isLoggedIn;
    if (isLoggedIn) {
      this.userData = JSON.parse(this.winServ.getLocalItem('userData'));
    }else{
      this.router.navigateByUrl('404');
    }
  }
  transactionDetail(id){
    $('.transaction-details').hide();
    $('#'+id).show(); 
    this.currentId = id;
  }
  printDiv(){
    var divToPrint = $('.transaction-details#' + this.currentId).html();
    let html = '<html>';
    html += '<title></title>';
    html += '<link href="' + this.AssetsUrl + 'css/style.css" rel="stylesheet">';
    html +=`
    <style type="text/css">
    @import url('https://fonts.googleapis.com/css?family=Montserrat:300,400,500,600,700,800&amp;subset=cyrillic,cyrillic-ext,latin-ext,vietnamese');
    @font-face {
        font-family: 'FrutigerNeueLTPro-Regular';
        src: url('assets/fonts/FrutigerNeueLTPro-Regular/FrutigerNeueLTPro-Regular.ttf') format('truetype');
        src: url('assets/fonts/FrutigerNeueLTPro-Regular/FrutigerNeueLTPro-Regular.eot?#iefix') format('embedded-opentype'),
         url('assets/fonts/FrutigerNeueLTPro-Regular/FrutigerNeueLTPro-Regular.woff2') format('woff2'),
         url('assets/fonts/FrutigerNeueLTPro-Regular/FrutigerNeueLTPro-Regular.woff') format('woff'),
         url('assets/fonts/FrutigerNeueLTPro-Regular/FrutigerNeueLTPro-Regular.svg#svgFontName') format('svg');
    }

    @font-face {
        font-family: 'FrutigerNeueLTPro-Medium';
        src: url('assets/fonts/frutiger-neue-lt-pro-medium/FrutigerNeueLTPro-Medium.eot');
        src: url('assets/fonts/frutiger-neue-lt-pro-medium/FrutigerNeueLTPro-Medium.eot?#iefix') format('embedded-opentype'), url('assets/fonts/frutiger-neue-lt-pro-medium/FrutigerNeueLTPro-Medium.woff2') format('woff2'), url('assets/fonts/frutiger-neue-lt-pro-medium/FrutigerNeueLTPro-Medium.woff') format('woff'), url('assets/fonts/frutiger-neue-lt-pro-medium/FrutigerNeueLTPro-Medium.ttf') format('truetype'), url('assets/fonts/frutiger-neue-lt-pro-medium/FrutigerNeueLTPro-Medium.svg#svgFontName') format('svg');
    }

    @font-face {
        font-family: 'FrutigerNeueLTPro-Bold';
        src: url('assets/fonts/frutiger-neue-lt-pro-bold/FrutigerNeueLTPro-Bold.eot');
        src: url('assets/fonts/frutiger-neue-lt-pro-bold/FrutigerNeueLTPro-Bold.eot?#iefix') format('embedded-opentype'), url('assets/fonts/frutiger-neue-lt-pro-bold/FrutigerNeueLTPro-Bold.woff2') format('woff2'), url('assets/fonts/frutiger-neue-lt-pro-bold/FrutigerNeueLTPro-Bold.woff') format('woff'), url('assets/fonts/frutiger-neue-lt-pro-bold/FrutigerNeueLTPro-Bold.ttf') format('truetype'), url('assets/fonts/frutiger-neue-lt-pro-bold/FrutigerNeueLTPro-Bold.svg#svgFontName') format('svg');
    }

    @font-face {
        font-family: 'FrutigerNeueLTPro-Light';
        src: url('assets/fonts/frutiger-neue-lt-pro-light/FrutigerNeueLTPro-Light.eot');
        src: url('assets/fonts/frutiger-neue-lt-pro-light/FrutigerNeueLTPro-Light.eot?#iefix') format('embedded-opentype'), url('assets/fonts/frutiger-neue-lt-pro-light/FrutigerNeueLTPro-Light.woff2') format('woff2'), url('assets/fonts/frutiger-neue-lt-pro-light/FrutigerNeueLTPro-Light.woff') format('woff'), url('assets/fonts/frutiger-neue-lt-pro-light/FrutigerNeueLTPro-Light.ttf') format('truetype'), url('assets/fonts/frutiger-neue-lt-pro-light/FrutigerNeueLTPro-Light.svg#svgFontName') format('svg');
    }
    @font-face {
      font-family: 'Theme-Montserrat-SemiBold';
      src: url('assets/fonts/Theme-Montserrat/Theme-Montserrat-SemiBold.eot');
      src: url('assets/fonts/Theme-Montserrat/Theme-Montserrat-SemiBold.eot?#iefix') format('embedded-opentype'),
      url('assets/fonts/Theme-Montserrat/Theme-Montserrat-SemiBold.woff2') format('woff2'),
      url('assets/fonts/Theme-Montserrat/Theme-Montserrat-SemiBold.woff') format('woff'),
      url('assets/fonts/Theme-Montserrat/Theme-Montserrat-SemiBold.ttf') format('truetype'),
      url('assets/fonts/Theme-Montserrat/Theme-Montserrat-SemiBold.svg#svgFontName') format('svg');
    }

    @media print {.invoice-comman-block {padding: 0 10px;}
       
    .invoice-extra-row {display: table;width: 100%;table-layout: fixed; text-align:center}
    .invoice-extra-row .extra-cell.title {text-align: center;font-size: 16px;color: #28292d;}.invoice-extra-row .extra-cell {display: table-cell;vertical-align: middle;text-align: center;padding-right: 10px;font-size: 16px;width:150px;}.invoice-address-para{padding-bottom:20px;}.invoice-detail-table{margin-top:50px;}*{-webkit-print-color-adjust: exact;
    }
  .invoice-extra-row.invoice-extra-row{
    text-align center!important;
    dispaly:inline-block;
  }
  }
  .invoice-block .footer{
    position: absolute;
    bottom: 40px;
    text-align: center;
    width: 100%;
    left: 0;
  }
  .invoice-block table tr td {
    font-size: 15px;
    border-top: 0px;
    
    vertical-align: top;
    padding-bottom: 8px;
    padding-top: 15px;
    padding-left: 12px;
  }
  .bold{
    font-family: 'FrutigerNeueLTPro-Bold';
  }
  .billing-address-block {
    margin-bottom: 30px;
    margin-top: 10px;
}
.heading-row{
  font-size: 18px !important;
}
.billing-address-block{
  margin-bottom: 30px;
  margin-top: 10px;
}
.footer{
  position: absolute;
  bottom: 40px;
  text-align: center;
  width: 100%;
  left: 0;
}
.thankyou-text {
  color: rgba(40, 41, 45, 0.54);
  font-size: 15px;
}
.invoice-extra-row{
  display: table;
  width: 100%;
  table-layout: fixed;
}
.invoice-extra-row .extra-cell.title{
  text-align: right;
  font-size: 16px;
  color: #28292d;
  display: table-cell;
  vertical-align: middle;
  padding-right: 10px;
}
.invoice-extra-row .extra-cell {
  display: table-cell;
  vertical-align: middle;
  text-align: left;
  padding-right: 10px;
  font-size: 16px;
}
    </style>
    `
    html += '<body onload="printPage()" style="font-family: FrutigerNeueLTPro-Regular">';
    html += ' <div class="invoice-block" >';
    html +=  divToPrint;
    html += '</div>';
    html += '<div class="clearfix"></div><div class="footer" style="text-align:center"><br><br><br></div><div class="clearfix"></div>';
    html += '</body>';
    html += '<script>function printPage(){ setTimeout(function(){window.print();window.close();}, 100) }</script>';
    html += '</html>';
    var newWin = window.open('','Print Window');
    newWin.document.open();
    newWin.document.write(html);
    newWin.document.close();  
  }
  changeDateFormat(date: string){
    return new Date(date);
  }
  parse(num){
    return parseFloat(num);
  }
  ngOnDestroy(){
    if (this.invoiceReq) {
      this.invoiceReq.unsubscribe();
    }
    if (this.inter) {
      clearInterval(this.inter);
    }
  }
}
