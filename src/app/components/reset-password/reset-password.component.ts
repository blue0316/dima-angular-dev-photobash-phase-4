import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { AppSettings } from "./../../app.setting";
import { Title, Meta } from "@angular/platform-browser";
import { HeaderSevice } from "./../../services/header.service";
import { ISubscription } from "rxjs/Subscription";
import { HeaderComponent } from "./../header/header.component";
import { WindowSevice } from "./../../services/window.service";
@Component({
  selector: "reset-password-page",
  templateUrl: "./reset-password.html",
  styleUrls: [],
  providers: [HeaderSevice]
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  passwordMismatch: boolean = false;
  password: string = "";
  cpassword: string = "";
  settingPassword: boolean = false;
  token: string = "";
  message: string = "";
  errorClass: boolean = false;
  isError: boolean = false;
  timeLeft: number = 5;
  changePasswordError: Object = {};
  verifyTokeReq: ISubscription;
  updatePasswordReq: ISubscription;
  queryParamReq;
  @ViewChild(HeaderComponent) $header: HeaderComponent;
  constructor(
    private titleService: Title,
    private headerServ: HeaderSevice,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private winServ: WindowSevice
  ) {
    this.titleService.setTitle("Reset Password");
  }

  ngOnInit() {
    if (this.winServ.getLocalItem("token")) {
      this.router.navigateByUrl("/404");
    }
    this.queryParamReq = this.activeRoute.queryParams.subscribe(
      (params: Params) => {
        this.token = params["token"] ? params["token"] : "";
        if (this.token) {
          this.verifyToken(this.token);
        } else {
          this.router.navigateByUrl("/404");
        }
      }
    );
  }
  checkLogin(isLoggedIn: boolean) {
    if (isLoggedIn) {
      this.router.navigateByUrl("/");
    }
  }
  updatePassword(form) {
    this.passwordMismatch = false;
    this.settingPassword = true;
    this.changePasswordError = {};
    this.updatePasswordReq = this.headerServ
      .updatePassword(this.password, this.cpassword, this.token)
      .subscribe(data => {
        if (data.status && data.status == 200) {
          this.isError = true;
          this.errorClass = false;
          let interval = setInterval(() => {
            this.timeLeft--;
            if (!this.timeLeft) {
              this.router.navigateByUrl("/");
              clearInterval(interval);
            }
          }, 1000);
          this.$header.headerNotifyalert("Success!", data.message, "success");
          form.reset();
        } else if (data.status == 503) {
          // this.isError = true;
          this.errorClass = true;
          this.message = data.error_message;
          this.$header.headerNotifyalert("Error!", data.error_message, "error");
        } else {
          // this.isError = true;
          this.errorClass = true;
          this.changePasswordError = data.errors ? data.errors : {};
          this.message =
            "And error occured while updating your password please try again after some time.";
          this.$header.headerNotifyalert("Error!", this.message, "error");
        }
        this.settingPassword = false;
      });
  }

  verifyToken(token) {
    this.verifyTokeReq = this.headerServ.verifyToken(token).subscribe(data => {
      if (data.status) {
        switch (data.status) {
          case 200:
            console.log("Token Verified!");
            break;
          default:
            console.log("Invalid Token!");
            this.router.navigateByUrl("/404");
            break;
        }
      } else {
        this.router.navigateByUrl("/404");
      }
    });
  }
  ngOnDestroy() {
    if (this.verifyTokeReq) {
      this.verifyTokeReq.unsubscribe();
    }
    if (this.updatePasswordReq) {
      this.updatePasswordReq.unsubscribe();
    }
    if (this.queryParamReq) {
      this.queryParamReq.unsubscribe();
    }
  }
}
