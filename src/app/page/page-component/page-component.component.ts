import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ChangeDetectorRef
} from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { AppSettings } from "../../app.setting";
import { Params } from "@angular/router/src/shared";
import { ISubscription } from "rxjs/Subscription";
import { CommonSevice } from "../../services/common.service";
import { Title, Meta } from "@angular/platform-browser";
@Component({
  selector: "app-page-component",
  templateUrl: "./page-component.component.html",
  styleUrls: ["./page-component.component.css"],
  providers: [CommonSevice]
})
export class PageComponentComponent implements OnInit, OnDestroy {
  serverImgPath: string = AppSettings.SERVER_IMG_PATH;
  imgPath: string = AppSettings.IMG_ENDPOIT;
  isLoggedIn: boolean = false;
  selectedPage: string;
  pages: Array<any> = [];
  faqData: Array<any> = [];
  faqCat: Array<any> = [];
  pageData: Object = {};
  isDataLoaded: boolean = false;
  pageId: any = 1;
  faqName: string = null;
  getPageDetailsReq: ISubscription;
  isFirstCall: boolean = true;
  selectedPageTitle: string = null;
  queryParamReq;
  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router,
    private comServ: CommonSevice,
    private titleService: Title,
    private zone: NgZone,
    private changeRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.queryParamReq = this.activeRoute.params.subscribe((params: Params) => {
      this.selectedPage = params["pageSlug"] ? params["pageSlug"] : null;
      this.activeRoute.queryParams.subscribe((params: Params) => {
        if (this.selectedPage != "faq") {
          this.pageId = 0;
        }
        if (params.page) {
          var page = params.page.split("-");
          this.pageId = page[page.length - 1];
        } else if (this.selectedPage == "faq") {
          this.pageId = 1;
        }
        this.getPageDetails(this.selectedPage, this.pageId);
      });
    });
  }
  checkLogin(isLoggedIn) {
    this.isLoggedIn = isLoggedIn;
  }
  gotToPage(pageSlug) {
    this.selectedPage = pageSlug;
    this.router.navigate([pageSlug]);
    // this.getPageDetails(pageSlug, null);
  }
  gotToFaq(faq) {
    this.pageId = faq.id;
    this.faqName = faq.value;
    if (this.pageId == 1) {
      this.zone.run(() => this.router.navigate(["/faq"]));
    } else {
      var slug = this.comServ.createSlugFromString(faq.value) + "-" + faq.id;
      this.zone.run(() =>
        this.router.navigate(["/faq"], { queryParams: { page: slug } })
      );
    }
  }
  getPageDetails(pageSlug, faqId) {
    this.isDataLoaded = false;
    // this.pages = [];
    this.faqData = [];
    this.getPageDetailsReq = this.comServ
      .post("webservices/getPageDetails", { slug: pageSlug, faqId: faqId })
      .subscribe(
        data => {
          if (pageSlug == "faq") {
            this.titleService.setTitle("FAQ");
            this.selectedPageTitle = "FAQ";
          } else {
            this.titleService.setTitle(data.data.title);
            this.selectedPageTitle = data.data.title;
          }
          this.pages = [];
          if (data.status) {
            switch (data.status) {
              case 200:
                this.pages = data.pages;
                this.faqCat = data.faqCat;
                let i = this.faqCat.findIndex($d => $d.id == faqId);
                if (i > -1 && this.faqCat[i]) {
                  this.faqName = this.faqCat[i].value;
                  // this.selectedPageTitle += ': '+this.faqName;
                } else {
                  this.faqName = null;
                }
                if (this.selectedPage == "faq") {
                  this.faqData = data.data;
                } else {
                  if (!data.data || !data.data.id) {
                    this.router.navigateByUrl("404");
                  } else {
                    this.pageData = data.data;
                  }
                }
                break;

              default:
                break;
            }
          }
          this.isDataLoaded = true;
          this.isFirstCall = false;
        },
        err => {
          this.isDataLoaded = true;
        }
      );
  }
  ngOnDestroy() {
    if (this.getPageDetailsReq) {
      this.getPageDetailsReq.unsubscribe();
    }
    if (this.queryParamReq) {
      this.queryParamReq.unsubscribe();
    }
  }
}
