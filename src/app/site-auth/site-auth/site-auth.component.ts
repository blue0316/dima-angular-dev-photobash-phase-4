import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validator, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { EncryptionService } from '../../services/encryption.service';
import { AppSettings } from '../../app.setting';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../services/auth.service';
import { CommonSevice } from '../../services/common.service';


@Component({
  selector: 'app-site-auth',
  templateUrl: './site-auth.component.html',
  styleUrls: ['./site-auth.component.css']
})
export class SiteAuthComponent implements OnInit {
  ImgPath: string = AppSettings.IMG_ENDPOIT;
  public authForm: FormGroup;
  public submitted: boolean = false;
  public sitePasswd: string = AppSettings.SITE_PASSWORD;

  cookieOptions = {
    expires: new Date(new Date().setMinutes(new Date().getMinutes() + 30))
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastService: ToastService,
    private encService: EncryptionService,
    private cookieService: CookieService,
    private authService: AuthService,
    private comServ: CommonSevice
  ) {}




  public initForm(): void {
    this.authForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(18)]]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.authForm.controls; }



  public onSubmit(): void {
    this.submitted = true;
    if (!this.authForm.valid) {
      return;
    } else {
      if (this.authForm.value.password === this.sitePasswd) {
        // password match
        this.cookieService.set('siteAuthToken', this.encService.encryptString(this.authForm.value.password), new Date(new Date().setMinutes(new Date().getMinutes() + 30))) // set value in cookie with expire time of 30 minutes
        this.toastService.showNotification('User authenticated!');
        this.authService.updateAuthenticationStatus();
        this.router.navigate(['/'])
      } else {
        this.notifyAlert(
          'Warning!',
          'Wrong password provided.',
          'info',
        );
        return;
      }
      this.submitted = false;
    }
  }



  notifyAlert(title, messageHTML, type, position = null, timer = 5000) {
    return this.comServ.notify(title, messageHTML, type, position, timer);
  }
 
  ngOnInit() {
    this.initForm();
  }
}
