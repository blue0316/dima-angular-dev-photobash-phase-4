import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppSettings } from '../app.setting';

@Injectable()
export class CommingSoonGuard implements CanActivate {
  constructor(private router: Router){

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if(!AppSettings.THREE_D_IN_DEV){
      return true;
    }
    this.router.navigate(['/comming-soon']);
  }
}
