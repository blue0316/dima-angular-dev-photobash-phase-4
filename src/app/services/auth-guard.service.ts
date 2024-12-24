import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import "rxjs/add/operator/takeUntil";
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {

  public isLoggedIn: boolean; // tell login status
  
  constructor(
    public auth: AuthService,
    public router: Router
  ) {
    this.auth.isAuthenticated.subscribe(val => this.isLoggedIn = val);
  }

  


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkLogin();
  }
  checkLogin(): boolean {
    if (this.isLoggedIn === true) {
      return true;
    } else {
      this.router.navigate(['/site_auth']);
      return false;
    }
  }

}
