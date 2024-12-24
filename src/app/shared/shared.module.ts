import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextMaskModule } from 'angular2-text-mask';
import { ModalModule } from 'ngx-bootstrap/modal';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { NoDataComponent } from '../components/no-data/no.result.component';
import {
  LoadingContentComponent,
  LoadingInfiniteComponent
} from '../components/loader/loading.component';
import { OrderByPipe } from '../pipes/order-by.pipe';
import { SecondsToTimePipe } from './../pipes/seconds-to-time.pipe';
import { StripeComponent } from './stripe/stripe.component';
import { SearchPipe } from './../pipes/search.pipe';
import { WindowSevice } from '../services/window.service';
import { ToastService } from '../services/toast.service';
import { SafeHtmlPipe } from './../pipes/safe-html.pipe';
import { OnlyNumbersDirective } from './../directives/only-numbers.directive';
import { MinvalueDirective } from './../directives/minvalue.directive';
import { PaymentModalComponent } from '../components/payment-modal/payment-modal.component';
import { EncryptionService } from '../services/encryption.service';
import { CookieService } from 'ngx-cookie-service';
import { AssideFilterComponent } from '../components/aside-filter/aside-filter.component';

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule, TextMaskModule, ModalModule.forRoot()],
  declarations: [
    HeaderComponent,
    FooterComponent,
    OrderByPipe,
    SecondsToTimePipe,
    NoDataComponent,
    LoadingContentComponent,
    LoadingInfiniteComponent,
    StripeComponent,
    SearchPipe,
    SafeHtmlPipe,
    OnlyNumbersDirective,
    MinvalueDirective,
    PaymentModalComponent,
    AssideFilterComponent
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    OrderByPipe,
    SecondsToTimePipe,
    NoDataComponent,
    LoadingContentComponent,
    LoadingInfiniteComponent,
    FormsModule,
    StripeComponent,
    SearchPipe,
    InfiniteScrollModule,
    SafeHtmlPipe,
    OnlyNumbersDirective,
    MinvalueDirective,
    PaymentModalComponent,
    AssideFilterComponent
  ],
  providers: [WindowSevice, ToastService, EncryptionService, CookieService]
})
export class SharedModule {}
