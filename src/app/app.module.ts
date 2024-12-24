import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AuthService } from './services/auth.service';
import { AuthGuardService } from './services/auth-guard.service';
import { UpdateService } from './services/update.service';
import { CommingSoonGuard } from './services/comming-soon.guard';
import { CommingSoonComponent } from './components/comming-soon/comming-soon.component';

/*  */
String.prototype.isNullOrWhitespace = function(): boolean {
  const input = String(this);
  // tslint:disable-next-line: typeof-compare
  if (typeof input === undefined || input == null) {
    return true;
  }

  return input.replace(/\s/g, '').length < 1;
};
String.prototype.isValidEmail = function(): boolean {
  const email = String(this);
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};
String.prototype.truncate = function(this: string, n: number) {
  return this.length > n ? this.substring(0, n - 1) + '...' : this;
};
String.prototype.trimAllSpace = function() {
  const input = String(this);
  return input.replace(/\s/g, '');
};
/*  */
/*Routes*/
const appRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadChildren: './home/home.module#HomeModule'
      }
    ],
    canActivate: [AuthGuardService]
  },
  {
    path: 'site_auth',
    children: [
      {
        path: '',
        loadChildren: './site-auth/site-auth.module#SiteAuthModule'
      }
    ]
  },
  {
    path: 'packs',
    children: [
      {
        path: '',
        loadChildren: './package/package.module#PackageModule'
      }
    ],
    canActivate: [AuthGuardService]
  },
  {
    path: 'images',
    children: [
      {
        path: '',
        loadChildren: './image/image.module#ImageModule'
      }
    ],
    canActivate: [AuthGuardService]
  },
  {
    path: 'about',
    children: [
      {
        path: '',
        loadChildren: './about/about.module#AboutModule'
      }
    ],
    canActivate: [AuthGuardService]
  },
  {
    path: 'subscriptions',
    children: [
      {
        path: '',
        loadChildren: './subscription/subscription.module#SubscriptionModule'
      }
    ],
    canActivate: [AuthGuardService]
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'support',
    children: [
      {
        path: '',
        loadChildren: './support/support.module#SupportModule'
      }
    ],
    canActivate: [AuthGuardService]
  },
  {
    path: 'payment-success',
    children: [
      {
        path: '',
        loadChildren: './payment/payment.module#PaymentModule'
      }
    ]
  },
  {
    path: 'payment-cancel',
    children: [
      {
        path: '',
        loadChildren: './payment/payment.module#PaymentModule'
      }
    ]
  },
  {
    path: 'payment-fail',
    children: [
      {
        path: '',
        loadChildren: './payment/payment.module#PaymentModule'
      }
    ]
  },
  {
    path: '404',
    children: [
      {
        path: '',
        loadChildren: './page-not-found/page-not-found.module#PageNotFoundModule'
      }
    ]
  },
  {
    path: 'collections',
    children: [
      {
        path: '',
        loadChildren: './collection/collection.module#CollectionModule'
      }
    ],
    canActivate: [AuthGuardService]
  },
  {
    path: 'invoices',
    children: [
      {
        path: '',
        loadChildren: './invoice/invoice.module#InvoiceModule'
      }
    ],
    canActivate: [AuthGuardService]
  },
  {
    path: 'purchases',
    children: [
      {
        path: '',
        loadChildren: './purchases/purchases.module#PurchasesModule'
      }
    ],
    canActivate: [AuthGuardService]
  },
  {
    path: 'import/verify-request',
    children: [
      {
        path: '',
        loadChildren: './import/import.module#ImportModule'
      }
    ]
  },
  {
    path: 'kits',
    children: [
      {
        path: '',
        loadChildren: './kits/kits.module#KitsModule'
      }
    ],
    canActivate: [AuthGuardService, CommingSoonGuard]
  },
  {
    path: 'models',
    children: [
      {
        path: '',
        loadChildren: './models/models.module#ModelsModule'
      }
    ],
    canActivate: [AuthGuardService, CommingSoonGuard]
  },
  {
    path: 'comming-soon',
    component: CommingSoonComponent
  },
  {
    path: ':pageSlug',
    children: [
      {
        path: '',
        loadChildren: './page/page.module#PageModule'
      }
    ],
    canActivate: [AuthGuardService]
  },
  {
    path: '**',
    redirectTo: '404',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [AppComponent, ResetPasswordComponent, CommingSoonComponent],
  imports: [
    NgbModule.forRoot(),
    TooltipModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    SharedModule,
    RouterModule.forRoot(appRoutes) /* , { useHash: true } */
  ],
  providers: [Title, AuthService, AuthGuardService, UpdateService, CommingSoonGuard],
  bootstrap: [AppComponent]
})
export class AppModule {}
