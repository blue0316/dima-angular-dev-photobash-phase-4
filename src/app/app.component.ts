import {
  Component,
  NgZone,
  Renderer,
  ElementRef,
  ViewChild,
  OnInit,
  ApplicationRef,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { Title } from '@angular/platform-browser';

import {
  Router,
  // import as RouterEvent to avoid confusion with the DOM Event
  Event as RouterEvent,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from '@angular/router';
import { EncryptionService } from './services/encryption.service';
import { AppSettings } from './app.setting';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './services/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('spinnerElement')
  spinnerElement: ElementRef;
  inter: any;
  routerEvnent;
  devToolClosed: boolean;
  public sitePasswd: string = AppSettings.SITE_PASSWORD;
  constructor(
    private router: Router,
    private ngZone: NgZone,
    private renderer: Renderer,
    private titleService: Title,
    private _applicationRef: ApplicationRef,
    private changeRef: ChangeDetectorRef,

    private authService: AuthService
  ) {
    this.devToolClosed = true;
    /* var element = new Image();
    let checkStatus: string;
    (element as any).__defineGetter__('id', () => {
      checkStatus = 'on';
      console.log(checkStatus);
      this.devToolClosed = false;
    });

    setInterval(() => {
      this.devToolClosed = true;
      checkStatus = 'off';
      console.log(element);
      console.clear();
    }, 1000); */
    this.routerEvnent = router.events.subscribe((event: RouterEvent) => {
      this.authService.updateAuthenticationStatus();
      this._navigationInterceptor(event);
      if (this.isMac() || true) {
        // console.log('Mac Screen !');
        if (event instanceof NavigationEnd) {
          if (this.inter) {
            clearInterval(this.inter);
          }
          this.inter = setInterval(() => {
            this.ngZone.run(() => {
              _applicationRef.tick();
              if (!this.changeRef['destroyed']) {
                this.changeRef.detectChanges();
              }
            });
          }, 1000);
        }
      }
    });
  }
  ngOnInit() {
    this.authService.updateAuthenticationStatus(); // check for site wide authentication

    if (!NodeList.prototype['forEach']) {
      Object.defineProperty(NodeList.prototype, 'forEach', {
        value: Array.prototype.forEach,
        enumerable: true,
        configurable: true,
        writable: true
      });
    }
  }
  // Shows and hides the loading spinner during RouterEvent changes
  private _navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      window.scrollTo(0, 0);
      this.ngZone.runOutsideAngular(() => {
        this.renderer.setElementStyle(this.spinnerElement.nativeElement, 'display', 'block');
      });
    }
    if (event instanceof NavigationEnd) {
      this._hideSpinner();
    }
    // Set loading state to false in both of the below events to
    // hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this._hideSpinner();
    }
    if (event instanceof NavigationError) {
      this._hideSpinner();
    }
  }

  private _hideSpinner(): void {
    this.ngZone.runOutsideAngular(() => {
      this.renderer.setElementStyle(this.spinnerElement.nativeElement, 'display', 'none');
    });
    document.body.className = document.body.className.replace('view-navigation', '');
  }
  private isMac() {
    if (navigator.userAgent.indexOf('Mac') > -1) {
      return true;
    }
    return false;
  }
  ngOnDestroy() {
    if (this.inter) {
      clearInterval(this.inter);
    }
    if (this.routerEvnent) {
      this.routerEvnent.unsubscribe();
    }
  }
}
