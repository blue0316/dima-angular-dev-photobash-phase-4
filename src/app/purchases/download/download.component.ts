import {
  Component,
  OnInit,
  OnDestroy,
  TemplateRef,
  ElementRef
} from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { CommonSevice } from "../../services/common.service";
import { ISubscription } from "rxjs/Subscription";
import { AppSettings } from "../../app.setting";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal/bs-modal-ref.service";
@Component({
  selector: "app-download",
  templateUrl: "./download.component.html",
  styleUrls: ["./download.component.css"],
  providers: [CommonSevice]
})
export class DownloadComponent implements OnInit, OnDestroy {
  dataLoaded: boolean;
  downloadUrl: string;
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  packDetails: any = { files: [] };
  getPackReq: ISubscription;

  modalRef: BsModalRef;
  config = {
    animated: true,
    keyboard: false,
    backdrop: true,
    ignoreBackdropClick: true,
    class: "account-modal comman-modal download-files-modal"
  };
  queryParamsReq;
  showDeadLinkError: Boolean = false;
  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private comSer: CommonSevice,
    private modalService: BsModalService,
    private eleRef: ElementRef
  ) {}
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, this.config);
  }
  closeModal() {
    location.href = "/";
  }
  ngOnInit() {
    this.dataLoaded = true;
    this.queryParamsReq = this.activeRoute.queryParams.subscribe(
      (params: Params) => {
        if (!params.hasOwnProperty("link")) {
          this.closePopup();
          location.href = "/404";
        }
        if (!params.hasOwnProperty("user")) {
          this.closePopup();
          location.href = "/404";
        }
        if (!params.hasOwnProperty("pack")) {
          this.closePopup();
          location.href = "/404";
        }
        this.getPackForDownload(params);
      }
    );
  }
  getPackForDownload(params) {
    this.getPackReq = this.comSer
      .post("webservices/getGuestPurchasedPackData", params)
      .subscribe(
        data => {
          if (data.status) {
            if (data.status == 200) {
              this.packDetails = data.data;
              this.openPopup();
              this.startTimer();
            } else if (data.status == 504) {
              this.showDeadLinkError = true;
              this.openPopup();
            } else {
              this.closePopup();
              location.href = "/404";
            }
          }
        },
        err => {
          location.href = "/404";
        }
      );
  }
  openPopup() {
    // let smallBox = this.eleRef.nativeElement.querySelector(
    //   "#download-archives-btn"
    // );
    // smallBox.dispatchEvent(new MouseEvent("click"));
    // setTimeout(() => {
    //   $(".download-files-modal").css(
    //     "margin-top",
    //     `${Math.max(
    //       0,
    //       ($(window).height() - $(".download-files-modal").height()) / 2
    //     )} !important`
    //   );
    // }, 10);
    setTimeout(() => {
      $("body")
        .find("#download-archives-btn")
        .click();
    }, 200);
  }
  checkLogin(isLoggedIn: boolean) {
    if (isLoggedIn) {
      this.closePopup();
      location.href = "/404";
    }
  }
  closePopup() {
    let smallBox = this.eleRef.nativeElement.querySelector(
      "#download-archives-close-btn"
    );
    smallBox.dispatchEvent(new MouseEvent("click"));
  }
  startTimer() {
    setInterval(() => {
      this.packDetails.timeLeft = this.packDetails.timeLeft - 1;
      if (this.packDetails.timeLeft < 0) {
        this.closePopup();
        this.router.navigateByUrl("/404");
      }
    }, 1000);
  }
  downloadAllPacks() {
    let ele = document.querySelectorAll(".download-pack");
    if (ele && ele.length > 0) {
      for (let index = 0; index < ele.length; index++) {
        const e = ele[index];
        var oldHref = e["href"].split("/");
        const href = oldHref[oldHref.length - 1];
        e["href"] = atob(href);
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, false);
        e.dispatchEvent(evt);
        e["href"] = href;
      }
    }
  }
  downloadThisPack(id) {
    let ele = document.getElementById(id);
    var oldHref = ele["href"].split("/");
    const href = oldHref[oldHref.length - 1];
    ele["href"] = atob(href);
    var evt = document.createEvent("MouseEvents");
    evt.initEvent("click", true, false);
    ele.dispatchEvent(evt);
    ele["href"] = href;
  }
  ngOnDestroy() {
    if (this.getPackReq) {
      this.getPackReq.unsubscribe();
    }
    if (this.queryParamsReq) {
      this.queryParamsReq.unsubscribe();
    }
    this.modalRef.hide();
  }
}
