import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title, Meta }     from '@angular/platform-browser';

import { AppSettings } from './../../../app.setting';
import { PackageService } from './../../../services/package.service';

@Component({
  selector: 'single-package',
  templateUrl: './single.package.component.html',
  styleUrls: [],
  providers:[PackageService]
})

export class SinglePackageComponent {
  
 	host: string = AppSettings.API_ENDPOINT;
  	ImgPath: string = AppSettings.IMG_ENDPOIT;
  	ServerImgPath: string = AppSettings.SERVER_IMG_PATH;
  
  	packageDetails = [];
  	isDataLoaded: boolean = false;
  	constructor(private packSer: PackageService, private route: ActivatedRoute, private router: Router, private titleService: Title, private metaService: Meta){
  		window.scrollTo(0, 0);
  		this.getPackDetails();
  	}

  	getPackDetails(){
  		let packSlug = '';
	  	let packIdArr = [];
	  	let packId = 0;
	  	this.route.params.subscribe(params => {
	      packSlug = params['packId'];
	      if(!packSlug){
	      	this.router.navigateByUrl('/404');
	      	return;
	      }
	      packIdArr = packSlug.split('-');
	      packId = parseInt(packIdArr[packIdArr.length-1]);
	      if(!packId){
	      	this.router.navigateByUrl('/404');
	      	return;
	      }
	      this.packSer.getSinglePackage(packId).subscribe(data=>{
	      	if (data.status==200 && data.data.id) {
	      		this.packageDetails = data.data;
	      		this.titleService.setTitle(data.data.pack_name+' | Packs');
	      		this.isDataLoaded = true;
	      	}else{
	      		this.router.navigateByUrl('/404');
	      		return;		
	      	}
	      })
	    });
  	}
}
