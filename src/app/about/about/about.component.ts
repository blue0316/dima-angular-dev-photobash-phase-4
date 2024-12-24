import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { CommonSevice } from '../../services/common.service';
import { Title } from '@angular/platform-browser';
import * as $ from 'jquery';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  providers: [CommonSevice]
})
export class AboutComponent implements OnInit {
  isLoggedIn: Boolean = false;
  isDataLoaded: Boolean = false;
  aboutContent: AboutInterface = {
    description: null
  };
  getAboutDetailsReq: ISubscription;
  constructor(private router: Router, private comServ: CommonSevice, private titleService: Title) {
    this.titleService.setTitle('About');
  }

  ngOnInit() {
    const slug = 'about';
    this.getPageDetails(slug);
    $('body').on('click', '.feature-tile .heading', function (event) {
      $('body').find('.currentActive').removeClass("currentActive")
      var attrval = $(this).attr("data-scrollvalue");
      var divname = '#'+ attrval;
      var offsetval = $(divname).offset().top;
      $('html, body').animate({ scrollTop: offsetval }, 1000);
      $(divname).addClass("currentActive")
    });
  }
  checkLogin(isLoggedIn) {
    this.isLoggedIn = isLoggedIn;
  }
  getPageDetails(pageSlug) {
    this.isDataLoaded = false;
    this.aboutContent = {
      description: null
    };
    this.getAboutDetailsReq = this.comServ.post('webservices/getPageDetails', { slug: pageSlug }).subscribe(data => {
      if (data.status) {
        switch (data.status) {
          case 200:
            if (!data.data || !data.data.description) {
              this.router.navigateByUrl('404');
            } else {
              this.aboutContent = data.data;
            }
            break;
          default:
            break;
        }
      }
      this.isDataLoaded = true;
    }, err => {
      this.isDataLoaded = true;
    });
  }
  ngOnDestroy = () => {
    if (this.getAboutDetailsReq) {
      this.getAboutDetailsReq.unsubscribe();
    }
  }
}
interface AboutInterface {
  description: Text;
}
