import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationEnd } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { AppSettings } from './../../app.setting';
import { CollectionService } from './../../services/collection.service';
import { WindowSevice } from './../../services/window.service';
import { ISubscription } from 'rxjs/Subscription';
import swal from 'sweetalert2';
import { ImageService } from '../../services/image.service';
import { HeaderComponent } from '../../components/header/header.component';
import { CommonSevice } from '../../services/common.service';
declare const $: any;
import * as spriteSpin from 'spritespin';
import { UpdateService } from '../../services/update.service';
import { ModelService } from '../../services/model.service';

@Component({
  selector: 'app-collection-page',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.css'],
  providers: [WindowSevice, CollectionService, ImageService, CommonSevice]
})
export class CollectionsComponent implements OnInit, OnDestroy {
  @ViewChild(HeaderComponent) $header: HeaderComponent;
  host: String = AppSettings.API_ENDPOINT;
  ImgPath: String = AppSettings.IMG_ENDPOIT;
  ServerImgPath: String = AppSettings.SERVER_IMG_PATH;
  showLoginPopup: Boolean = false;
  token: String;
  currentUrl: String;
  dataLoaded: Boolean = false;
  dataLoading: Boolean = true;
  renameBtnDis: Boolean = false;
  isRenameError: Boolean = false;
  RenameError: String;
  DeleteError: String;
  addBtnDis: Boolean = false;
  isAddError: Boolean = false;
  AddError: String;
  Errors: any = {
    name: '',
    addname: ''
  };
  collections: Array<any> = [];
  selectedCol = {
    index: 0,
    id: 0,
    name: '',
    images: { ids: [], urls: [], colIds: [], sizes: [] }
  };
  colName: String = '';
  newColName: String = '';
  successMessage: String = '';
  infoMessage: String = '';
  warningMessage: String = '';
  errorMessage: String = '';
  offset: Number = 0;
  limit: Number = AppSettings.IMG_PER_PAGE;
  currentIndex: Number = -1;
  isAddSuccess: Boolean = false;
  AddSuccess: String = '';
  searchKeyword: String = '';
  collectionData: Array<any> = [];
  collectionImages: Array<any> = [];
  showBrowseOption: Boolean = false;
  downloadingImage: Boolean = false;
  collectionId: any;
  filterImages: any = [];
  imageHeightToDownload: any = 0;
  imageWidthToDownload: any = 0;
  downloadUrl: String;
  widthError: Boolean = false;
  purchasingCollection: Boolean = false;

  getCollectionReq: ISubscription;
  addCollectionReq: ISubscription;
  renameCollectionReq: ISubscription;
  deleteCollectionReq: ISubscription;
  purchaseImageReq: ISubscription;
  downloadReq: ISubscription;
  userPlanDetails: any = {};
  planFacilities: any = {};
  planfacilitiesToolTip: any = {};
  selectedSize: any = [];
  userData: any;
  isPreviewLoaded: Array<Boolean> = [];
  downloadImageName: string = null;
  isPreviousCallComplete: Boolean = false;
  isMoreDataAvail: Boolean = false;
  moreDataLoading: Boolean = false;
  showNoData: Boolean = false;
  routerEvent;
  queryParamEvent;
  threeDImgLoading: boolean;
  isUserLoggedIn: boolean;
  collectionAll: Boolean = false;
  lastCollectionId: string = null;
  @HostListener('document:keyup', ['$event']) onEvent($event: any) {
    if ($event.key && $event.key === 'ArrowRight') {
      // for right keypress
      const ele = $('body')
        .find('.open-grid-info.resultitem')
        .next()
        .find('.clickevent');
      if (ele[0]) {
        ele[0].click();
      }
    } else if ($event.key && $event.key === 'ArrowLeft') {
      // for left keypress
      const ele = $('body')
        .find('.open-grid-info.resultitem')
        .prev()
        .find('.clickevent');
      if (ele[0]) {
        ele[0].click();
      }
    } else if ($event.key && $event.key === 'Escape') {
      // for esc keypress
      const ele = $('body')
        .find('.open-grid-info.resultitem')
        .find('.detailClose');
      if (ele[0]) {
        ele[0].click();
      }
    }
  }
  @HostListener('touchstart', [])
  @HostListener('window:scroll', [])
  onWindowScroll($event: any) {
    let currentPosition: number = window.pageYOffset ? window.pageYOffset : 0;
    currentPosition = this.parseInt(currentPosition.toString());
    const eleHeight: number = this.parseInt(
      $('.pictureView.viewchange').height()
        ? $('.pictureView.viewchange')
            .height()
            .toString()
        : '0'
    );
    const footerHeight: number = this.parseInt(
      $('footer')
        .height()
        .toString()
    );
    if (
      this.dataLoaded &&
      this.isMoreDataAvail &&
      this.isPreviousCallComplete &&
      currentPosition >= eleHeight - (footerHeight + 1800)
    ) {
      this.isPreviousCallComplete = false;
      setTimeout(() => {
        this.getCollectionsMoreData(this.collectionId);
      }, 500);
    }
  }
  constructor(
    private colService: CollectionService,
    private winServ: WindowSevice,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private titleService: Title,
    private imageSer: ImageService,
    private comServ: CommonSevice,
    private eleRef: ElementRef,
    private updateService: UpdateService,
    private modelService: ModelService
  ) {
    this.titleService.setTitle('Collections');
    if (this.winServ.isLocalStoragSupported() && this.winServ.getLocalItem('token')) {
      this.token = this.winServ.getLocalItem('token');
    } else {
      this.router.navigateByUrl('404');
    }
  }

  parseInt = (name: string): number => {
    return parseInt(name, 10);
  };
  ngOnInit() {
    /**
     *
     */
    $('body').on('click', '.swal2-container', e => {
      if (this.lastCollectionId) {
        swal.close();
        this.router.navigate(['/collections'], {
          queryParams: {
            collection: this.lastCollectionId
          }
        });
      }
    });
    /**
     *
     */
    this.queryParamEvent = this.activeRoute.queryParams.subscribe((params: Params) => {
      this.collectionId = params['collection'];
      this.searchKeyword = params['search'];
      if (this.searchKeyword) {
        this.showNoData = true;
      } else {
        this.showNoData = false;
      }
    });
    this.routerEvent = this.router.events.subscribe(data => {
      if (data instanceof NavigationEnd) {
        this.queryParamEvent = this.activeRoute.queryParams.subscribe((params: Params) => {
          this.offset = 0;
          this.isPreviousCallComplete = false;
          this.dataLoading = true;
          this.dataLoaded = false;
          this.collectionId = params['collection'];
          this.searchKeyword = params['search'];
          if (this.searchKeyword) {
            this.showNoData = true;
          } else {
            this.showNoData = false;
          }
          this.collectionImages = [];
          this.getCollections(this.collectionId);
        });
      }
    });
  }
  getCollections = (colId: any) => {
    if (this.getCollectionReq) {
      this.getCollectionReq.unsubscribe();
    }
    this.offset = 0;
    this.isPreviousCallComplete = false;
    this.getCollectionReq = this.colService
      .getCollections(
        this.token,
        this.offset,
        this.limit,
        false,
        this.searchKeyword,
        this.collectionId
      )
      .subscribe(data => {
        if (data.status && data.data) {
          switch (data.status) {
            case 200:
              const $data = data.data;
              const $col = data.collections;
              const collection = $col;
              this.collectionImages = $data;
              this.collectionData = [];
              this.collections = collection;
              if (colId && colId !== -1) {
                this.currentIndex = collection.findIndex(d => d.id == colId);
              } else {
                this.currentIndex = -1;
              }
              this.setSelectedCol(this.currentIndex);
              const len = this.offset;
              const _that = this;
              setTimeout(function() {
                this.InitializeGoogleGallary(); // this.init('.pictureView.viewchange');
                let i = 1;
                _that.eleRef.nativeElement.querySelectorAll('.clickevent').forEach(function(ele) {
                  if (i > len) {
                    ele.addEventListener('click', _that.onImageView.bind(_that), false);
                  }
                  i++;
                });
              }, 500);
              this.offset = this.offset + data.data.length;
              this.isPreviousCallComplete = true;
              this.isMoreDataAvail = data.data.length >= this.limit ? true : false;
              setTimeout(() => {
                this.showBrowseOption = true;
              }, 1500);
              setTimeout(function() {
                this.collectionGallery();
              }, 0);
              break;
            case 401:
              this.router.navigateByUrl('/404');
              break;
            default:
              this.router.navigateByUrl('/404');
              break;
          }
          this.dataLoading = false;
          this.dataLoaded = true;
        }
      });
  };
  getCollectionsMoreData(colId: any) {
    this.isPreviousCallComplete = false;
    if (this.getCollectionReq) {
      this.getCollectionReq.unsubscribe();
    }
    this.moreDataLoading = true;
    this.getCollectionReq = this.colService
      .getCollections(
        this.token,
        this.offset,
        this.limit,
        true,
        this.searchKeyword,
        this.collectionId
      )
      .subscribe(data => {
        if (data.status && data.data) {
          switch (data.status) {
            case 200:
              const $data = data.data;
              for (let index = 0; index < $data.length; index++) {
                const $d = $data[index];
                this.collectionImages.push($d);
              }
              const len = this.offset;
              const _that = this;
              setTimeout(function() {
                this.InitializeGoogleGallary(); // this.init('.pictureView.viewchange');
                let i = 1;
                _that.eleRef.nativeElement.querySelectorAll('.clickevent').forEach(function(ele) {
                  if (i > len) {
                    ele.addEventListener('click', _that.onImageView.bind(_that), false);
                  }
                  i++;
                });
              }, 500);
              this.offset = this.offset + data.data.length;
              this.isPreviousCallComplete = true;
              this.isMoreDataAvail = data.data.length >= this.limit ? true : false;
              setTimeout(() => {
                this.showBrowseOption = true;
              }, 1500);
              this.moreDataLoading = false;
              break;
            case 401:
              this.router.navigateByUrl('/404');
              break;
            default:
              this.router.navigateByUrl('/404');
              break;
          }
        }
      });
  }
  setSelectedCol = (index, isFromWeb = false) => {
    if (index === -1) {
      this.selectedCol.index = -1;
      this.selectedCol.id = 0;
      const string =
        this.collections.length > 1 || this.collections.length === 0 ? 'Collections' : 'Collection';
      this.selectedCol.name = this.collections.length + ' ' + string; // 'All';
      this.collectionId = 0;
      if (isFromWeb) {
        this.setCollectionImages(0, isFromWeb);
      }
      this.collectionAll = true;
    } else if (this.collections[index]) {
      this.selectedCol.index = index;
      this.selectedCol.id = this.collections[index].id;
      this.selectedCol.name = this.collections[index].name;
      this.colName = this.collections[index].name;
      if (isFromWeb) {
        this.setCollectionImages(this.collections[index].id, isFromWeb);
      }
      this.collectionAll = false;
    }
    setTimeout(function() {
      this.InitializeGoogleGallary();
    }, 500);
  };
  setCollectionImages(collectionId, isFromWeb = false) {
    if (isFromWeb) {
      const params = {};
      if (collectionId) {
        params['collection'] = collectionId;
      }
      // if (this.searchKeyword && collectionId != 0) {
      //   params['search'] = this.searchKeyword;
      // }
      this.router.navigate(['/collections'], { queryParams: params });
    }
  }
  removeFilter() {
    this.searchKeyword = '';
    this.router.navigate(['/collections']);
  }
  onImageView(event) {
    let img_id = null;
    let index = -1;
    let type = '0';
    if (event.target) {
      img_id = $(event.target).attr('data-id');
      type = $(event.target).attr('data-type');
      index = parseInt($(event.target).attr('data-index'), 10);
      setTimeout(() => {
        if (type === '1') {
          this.threeDImgLoading = true;
          this.collectionImages[index].smodel_format = this.collectionImages[index].model_format
            ? this.collectionImages[index].model_format.match(/[^ ,]+/g).join(', ')
            : null;
        }
        if (img_id) {
          if (this.collectionImages[index] && !this.collectionImages[index].image_thumbnail_main) {
            const token = this.token ? this.token : '';
            let url;
            if (type == '0') {
              url = 'webservices/getMainImage?img=' + img_id + '&token=' + token;
            } else {
              url = 'webservices/getMainModelImg?modelId=' + img_id + '&token=' + token;
            }
            this.comServ.get(url).subscribe(data => {
              // console.log(data);
              if (data.status) {
                switch (data.status) {
                  case 200:
                    if (data.data && data.data.url) {
                      if (type === '0') {
                        this.collectionImages[index].image_thumbnail_main = this.trustAsURL(
                          data.data.url
                        );
                        this.collectionImages[index].image_preview_zoom =
                          data.data.image_preview_zoom;
                        this.collectionImages[index].ratio = data.data.ratio;
                      } else {
                        this.collectionImages[index].preview = [];
                        let tempPreview = data.data.preview ? JSON.parse(data.data.preview) : [];
                        if (tempPreview.length > 0) {
                          for (let i = 0; i < tempPreview.length; i++) {
                            const preViewURL = tempPreview[i];
                            let newPreView = this.ServerImgPath + preViewURL;
                            this.collectionImages[index].preview.push(newPreView);
                          }
                        }
                        this.collectionImages[index].available_types = data.data.available_types;
                        if (
                          this.collectionImages[index].preview &&
                          this.collectionImages[index].preview.length > 0
                        ) {
                          $('#' + `remove-ele-${index}`).spritespin({
                            source: this.collectionImages[index].preview,
                            width: 550, // width of image
                            height: 550 / data.data.ratio, // heignt of image
                            sense: -1, // touch sesivity
                            animate: true, // auto rotate or manual
                            loop: true, // whether to loop animation
                            frameTime: 100 // animation speed
                          });
                        } else {
                          this.threeDImgLoading = false;
                        }
                      }
                    }
                    this.threeDImgLoading = false;
                    break;
                  default:
                    this.threeDImgLoading = false;
                    break;
                }
              }
            });
          }
        } else {
          this.threeDImgLoading = false;
        }
      }, 50);
    }
  }
  getMainImage(index: number) {
    let type = '0';
    if (event.target) {
      type = $(event.target).attr('data-type');
    }
    const img = this.collectionImages[index];
    if (type === '1') {
      this.threeDImgLoading = true;
    }
    if (img) {
      $('body')
        .find('#remove-ele-' + index)
        .css('display', 'block');
      const token = this.token ? this.token : '';
      let url;
      if (!type) {
        url = 'webservices/getMainImage?img=' + img.image_id + '&token=' + token;
      } else {
        url = 'webservices/getMainModelImg?modelId=' + img.model_id + '&token=' + token;
      }
      this.comServ.get(url).subscribe(data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              if (data.data && data.data.url) {
                if (!type || type === '0') {
                  this.collectionImages[index].image_thumbnail_main = this.trustAsURL(
                    data.data.url
                  );
                  this.collectionImages[index].image_preview_zoom = data.data.image_preview_zoom;
                  this.collectionImages[index].ratio = data.data.ratio;
                } else {
                  this.collectionImages[index].preview;
                  let tempPreview = data.data.preview ? JSON.parse(data.data.preview) : [];
                  this.collectionImages[index].available_types = data.data.available_types;
                  if (tempPreview.length > 0) {
                    for (let i = 0; i < tempPreview.length; i++) {
                      const preViewURL = tempPreview[i];
                      let newPreView = this.ServerImgPath + preViewURL;
                      this.collectionImages[index].preview.push(newPreView);
                    }
                  }
                  if (
                    this.collectionImages[index].preview &&
                    this.collectionImages[index].preview.length > 0
                  ) {
                    this.threeDImgLoading = false;

                    $('#' + `remove-ele-${index}`).spritespin({
                      source: this.collectionImages[index].preview,
                      width: 550, // width of image
                      height: 550 / data.data.ratio, // heignt of image
                      sense: -1, // touch sesivity
                      animate: true, // auto rotate or manual
                      loop: true, // whether to loop animation
                      frameTime: 100 // animation speed
                    });
                  } else {
                    this.threeDImgLoading = false;
                  }
                }
              }
              this.threeDImgLoading = false;
              break;
            default:
              this.threeDImgLoading = false;
              break;
          }
        }
      });
    }
  }
  trustAsURL(url: string) {
    return this.comServ.trustAsDataURI(url);
  }
  previewLoaded(index) {
    $('body')
      .find('#remove-ele-' + index)
      .css('display', 'none');
    this.isPreviewLoaded[index] = true;
    setTimeout(function() {
      this.zoomImage('xzoom-' + index, true);
    }, 10);
  }
  addnameCol(form: NgForm) {
    this.addBtnDis = true;
    this.isAddError = false;
    this.AddError = '';
    this.isAddSuccess = false;
    this.AddSuccess = '';
    const data = {
      token: this.token,
      img_id: 0,
      name: this.newColName
    };
    this.Errors = {};
    this.addCollectionReq = this.colService.addnameCol(data).subscribe(data => {
      if (data.status == 200) {
        const newCol = {
          id: data.data['id'],
          name: this.newColName,
          count: 0,
          totalImages: '0'
        };
        this.collections.push(newCol);
        // if (length == 0){
        this.setSelectedCol(-1);
        // }
        if (this.newColName) {
          // this.isAddSuccess = true;
          this.AddSuccess = data.message;
          form.resetForm();
          this.isAddSuccess = false;
          this.AddSuccess = '';
          $('body')
            .find('#collection-add')
            .find('.close:first')
            .click();
          this.Errors = {};
        } else {
          this.successMessage = data.message;
        }
        // this.newColName = null;
        $('body #btnCloseAdd').click();
        this.imageCollectionalert('Success!', data.message, 'success', undefined, 7000, () => {
          console.log('Callback called for sw2 in else');
          this.lastCollectionId = null;
        });
        this.lastCollectionId = data.data.id;
        setTimeout(function() {
          this.collectionGallery();
        }, 0);
        this.addBtnDis = true;
      } else {
        this.AddError = data.message;
        if (data.errors) {
          this.Errors = data.errors;
        }
        this.imageCollectionalert('Error!', data.message, 'error');
      }
      this.messageFadeout();
      this.addBtnDis = false;
    });
  }
  cancelRename() {
    this.colName = this.selectedCol.name;
    $('body')
      .find('#collection-rename')
      .find('.close:first')
      .click();
  }
  renameCol(form: NgForm) {
    this.renameBtnDis = true;
    this.isRenameError = false;
    this.RenameError = '';
    const data = {
      token: this.token,
      id: this.selectedCol.id,
      name: this.colName
    };
    this.renameCollectionReq = this.colService.renameCol(data).subscribe(data => {
      if (data.status == 200) {
        const index = this.collections.findIndex(d => d.id == this.selectedCol.id);
        this.selectedCol.name = this.colName.toString();
        this.collections[index].name = this.colName;
        this.successMessage = data.message;
        $('body #btnCloseRename').click();
        $('body')
          .find('#collection-rename')
          .find('.close:first')
          .click();
        this.renameBtnDis = false;
        this.imageCollectionalert('Success!', data.message, 'success');
        return;
      } else {
        this.RenameError = data.error_message;
        if (data.errors) {
          this.Errors = data.errors;
        }
        this.imageCollectionalert('Error!', data.error_message, 'error');
      }
      this.messageFadeout();
      this.renameBtnDis = false;
    });
  }
  deleteCol(id) {
    swal({
      customClass: 'delete-modal-box',
      titleText: 'Confirmation',
      padding: 0,
      html:
        '<div class="delete-modal-body"><p>Delete <span class="text-blue">' +
        this.selectedCol.name +
        '</span> Collection? </p><p>This action cannot be undone.</p></div>',
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      background: '#f3f3f5',
      buttonsStyling: false,
      confirmButtonClass: 'btn btn-theme-white',
      cancelButtonClass: 'btn btn-cancle',
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      animation: false
    }).then(result => {
      if (result.value) {
        this.colService.deleteCol(this.token, id).subscribe(data => {
          if (data.status == 200) {
            const index = this.selectedCol.index;
            this.collections.splice(index, 1);
            if (this.collections.length > 0) {
              this.setSelectedCol(0);
            } else {
              this.selectedCol = {
                index: 0,
                id: 0,
                name: null,
                images: {
                  ids: [],
                  urls: [],
                  colIds: [],
                  sizes: []
                }
              };
              this.collectionData = [];
              this.setSelectedCol(-1);
            }
            this.successMessage = data.message;
            this.imageCollectionalert('Deleted!', data.message, 'success');
            this.router.navigate(['/collections']);
          } else {
            this.errorMessage = data.error_message;
            this.imageCollectionalert('Error!', data.error_message, 'error');
          }
          this.messageFadeout();
        });
      }
    });
  }
  deleteColImg(id, index, collId, type) {
    this.deleteCollectionReq = this.colService
      .deleteColImg(this.token, id, this.selectedCol.id, collId, type)
      .subscribe(data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              this.collectionImages.splice(index, 1);
              this.getCollections(this.selectedCol.id);
              // swal('Deleted!', data.message, 'success');
              this.imageCollectionalert('Deleted!', data.message, 'success');
              break;
            default:
              // swal('Error!', 'An error occure while deleting image, please try again', 'error');
              this.imageCollectionalert(
                'Error!',
                'An error occure while deleting image, please try again.',
                'error'
              );
              break;
          }
        }
      });
  }
  removeMessage(message: string) {
    this.successMessage = message;
  }
  messageFadeout() {
    setTimeout(() => {
      this.successMessage = '';
      this.infoMessage = '';
      this.warningMessage = '';
      this.errorMessage = '';
    }, 5000);
  }
  searchImages() {
    if (this.searchKeyword) {
      const Qparam = { search: this.searchKeyword };
      if (this.collectionId) {
        Qparam['collection'] = this.collectionId;
      }
      this.router.navigate(['/collections'], { queryParams: Qparam });
    } else {
      let params = {};
      if (this.collectionId) {
        params['collection'] = this.collectionId;
      }
      this.showNoData = false;
      this.router.navigate(['/collections'], { queryParams: params });
    }
    /* this.setCollectionImages(this.selectedCol.id); */
  }
  downloadThisImage(index, width, height, reCalled) {
    const remainingCredits = this.userData.remainingCredits ? this.userData.remainingCredits : 0;
    const $image = this.collectionImages[index];
    const ratio = this.collectionImages[index].ratio;
    const price_credits = this.collectionImages[index].price_credits;
    if (parseInt(price_credits, 10) > parseInt(remainingCredits, 10)) {
      const _that = this;
      this.showAlert(
        'Oops..',
        '<div class="credit-spend-confirm text-left clearfix"><p>You do not have enough <b>Credits</b></p><p>Would you like to add some ?</p></div>',
        'warning',
        'Add Credits',
        'Cancel'
      ).then(function(result) {
        if (result.value) {
          _that.$header.getAndUpdateCustomCredits();
          const ele = $('body').find('#add-credit-modal-btn');
          if (ele[0]) {
            ele[0].click();
          }
        }
      });
      return;
    }
    this.imageHeightToDownload = Math.round(this.imageWidthToDownload * ratio);
    const token = this.winServ.getLocalItem('token');
    const imageWidth =
      width == 'custom_width'
        ? this.imageWidthToDownload
        : width == 'width'
        ? 'width'
        : this.collectionImages[index][width];
    const imageHeight =
      height == 'custom_height'
        ? this.imageHeightToDownload
        : height == 'height'
        ? 'height'
        : this.collectionImages[index][height];
    const imageId = this.collectionImages[index]['image_id'];
    if (!token) {
      this.imageCollectionalert('Info!', 'You need to login to download image.', 'info');
    }
    if (!imageHeight || !imageWidth || !imageId) {
      this.imageCollectionalert('Error!', 'Unknown Error.', 'error');
      return;
    }
    this.downloadingImage = true;
    const type = this.selectedSize[index];
    this.downloadReq = this.imageSer
      .downloadImage(token, imageId, imageWidth, imageHeight, type)
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                this.imageWidthToDownload = 0;
                this.imageHeightToDownload = 0;
                this.selectedSize = [];
                if (data.data && data.data.url) {
                  this.downloadUrl = data.data.url;
                  const img = $('body .downloadImg');
                  if (img && img[0]) {
                    setTimeout(() => {
                      img[0].click();
                      this.$header.updateUserData();
                      this.downloadingImage = false;
                    }, 1000);
                  } else {
                    this.imageCollectionalert(
                      'Error!',
                      'An error occure while downloading image.',
                      'error'
                    );
                    this.downloadingImage = false;
                  }
                } else {
                  this.imageCollectionalert('Error!', 'Invalid image download request.', 'error');
                  this.downloadingImage = false;
                }
                break;
              case 401:
                if (reCalled || data.isHideConfirm == '1') {
                  this.purchaseImage(
                    $image,
                    this.winServ.getLocalItem('token'),
                    true,
                    width,
                    height
                  );
                } else {
                  const message =
                    '<div class="credit-spend-confirm text-left"><p>You are about to spend <span class="text-blue">' +
                    price_credits +
                    '</span> credits.</p><p>Are you sure ?</p><div class="alert-stop-confirm"><div class="checkbox checkbox-white "><input type="checkbox" class="do-not-show-img-purchase" id="do-not-show-img-purchase"/> <label for="do-not-show-img-purchase">Don\'t show this again.</label></div></div></div>';
                  const _that = this;
                  const alertRes = this.showAlert(
                    'Confirmation',
                    message,
                    'success',
                    'OK',
                    'Cancel'
                  );
                  alertRes.then(result => {
                    if (result.value) {
                      const hideConfirm = _that.winServ.getLocalItem('hideImageConfirm')
                        ? true
                        : false;
                      _that.purchaseImage(
                        $image,
                        _that.winServ.getLocalItem('token'),
                        hideConfirm,
                        width,
                        height
                      );
                      _that.winServ.removeItem('hideImageConfirm');
                    } else {
                      _that.downloadingImage = false;
                    }
                  });
                }
                break;
              case 400:
                this.imageCollectionalert('Error!', data.error_message, 'error');
                this.downloadingImage = false;
                break;
              default:
                this.imageCollectionalert(
                  'Error!',
                  data.message ? data.message : 'An unknown error occure while downloading image.',
                  'error'
                );
                this.downloadingImage = false;
                break;
            }
          }
        },
        err => {
          this.imageWidthToDownload = 0;
          this.imageHeightToDownload = 0;
          this.selectedSize = [];
          this.imageCollectionalert(
            'Error!',
            'An unknown error occure while downloading image.',
            'error'
          );
          this.downloadingImage = false;
        }
      );
  }
  downloadPreview(index: number) {
    const $d = this.collectionImages[index];
    if (!this.isPreviewLoaded[index]) {
      this.$header.headerNotifyalert('Info!', 'Please wait while preview is loading.', 'info');
      return;
    }
    if ($d) {
      this.downloadUrl = $d.image_thumbnail_main;
      let ext = null;
      if (this.downloadUrl) {
        if (this.downloadUrl['changingThisBreaksApplicationSecurity']) {
          this.downloadUrl = this.downloadUrl['changingThisBreaksApplicationSecurity'];
        }
        const urlSpl = this.downloadUrl.split(',');
        if (urlSpl[0]) {
          const urlSpl2 = urlSpl[0].split(':');
          if (urlSpl2[1]) {
            const urlSpl3 = urlSpl2[1].split(';');
            if (urlSpl3[0]) {
              const urlSpl4 = urlSpl3[0].split('/');
              if (urlSpl4[1]) {
                ext = urlSpl4[1];
              }
            }
          }
        }
      }
      this.downloadImageName = $d.image_name + ' Preview.' + ext;
      const img = $('body .downloadImg');
      if (img && img[0]) {
        setTimeout(() => {
          img[0].click();
          this.downloadingImage = false;
        }, 1000);
      }
    }
  }
  purchaseImage(imageDetails, token, hideConfirm, width, height) {
    const index = this.collectionImages.findIndex(d => d.image_id == imageDetails.image_id);
    if (index > -1) {
      this.isPreviewLoaded[index] = false;
      $('body')
        .find('#remove-ele-' + index)
        .css('display', 'block');
    }
    this.purchaseImageReq = this.imageSer
      .purchaseImageByCredits(imageDetails.image_id, token, imageDetails.price_credits, hideConfirm)
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                console.log('index', index);
                if (index > -1) {
                  this.collectionImages[index].isPurchased = 1;
                  this.isPreviewLoaded[index] = false;
                  this.getMainImage(index);
                }
                this.$header.updateUserData();
                this.downloadThisImage(index, width, height, true);
                break;
              case 204:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                $('body')
                  .find('#remove-ele-' + index)
                  .css('display', 'none');
                break;
              case 400:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                $('body')
                  .find('#remove-ele-' + index)
                  .css('display', 'none');
                break;
              case 401:
                const _that = this;
                this.showAlert('Opps..', data.message, 'warning', 'Add Credits', 'Cancel').then(
                  function(result) {
                    if (result.value) {
                      _that.router.navigateByUrl('/subscriptions');
                    }
                  }
                );
                this.downloadingImage = false;
                $('body')
                  .find('#remove-ele-' + index)
                  .css('display', 'none');
                break;
              case 403:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                $('body')
                  .find('#remove-ele-' + index)
                  .css('display', 'none');
                break;
              case 404:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                $('body')
                  .find('#remove-ele-' + index)
                  .css('display', 'none');
                break;
              case 500:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                $('body')
                  .find('#remove-ele-' + index)
                  .css('display', 'none');
                break;
              default:
                this.imageCollectionalert(
                  'Error!',
                  'An unknown error occure, please try after some time.',
                  'error'
                );
                this.downloadingImage = false;
                $('body')
                  .find('#remove-ele-' + index)
                  .css('display', 'none');
                break;
            }
          }
        },
        err => {
          console.log(err);
          this.imageCollectionalert(
            'Error!',
            'An unknown error occure, please try after some time.',
            'error'
          );
          this.downloadingImage = false;
        }
      );
  }
  widthUpdated(ratio) {
    this.widthError = false;
    const res = /^[0-9]+$/.test(this.imageWidthToDownload.toString());
    if (!res) {
      this.widthError = true;
      const imgWidth = parseInt(this.imageWidthToDownload.toString(), 10);
      this.imageWidthToDownload = imgWidth ? imgWidth : 0;
    }
    this.imageHeightToDownload = Math.round(this.imageWidthToDownload * ratio);
  }
  /**
   *
   */
  clearSearchInput = () => {
    this.searchKeyword = '';
    $('#search-tags').focus();
  };
  showAlert(
    title,
    messageHTML,
    type,
    confirmButtonText,
    cancelButtonText,
    hideDeleteClass = false
  ) {
    let classToApply = hideDeleteClass ? '' : 'delete-modal-body';
    let customClass = !hideDeleteClass
      ? 'delete-modal-box credit-spend-modal'
      : 'delete-modal-box credit-spend-modal collect-purchase-confirm-modal-box';
    return swal({
      customClass: customClass,
      titleText: title,
      padding: 0,
      html: '<div class="' + classToApply + '">' + messageHTML + '</div>',
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      background: '#f3f3f5',
      buttonsStyling: false,
      confirmButtonClass: 'btn btn-theme-white',
      cancelButtonClass: 'btn btn-cancle',
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      animation: false
    });
  }
  imageCollectionalert(title, messageHTML, type, position = null, timer = 5000, cb = null) {
    return this.comServ.notify(title, messageHTML, type, position, timer, cb);
  }
  checkLogin(loggedIn) {
    if (!loggedIn) {
      this.isUserLoggedIn = false;
      this.router.navigateByUrl('/404');
    } else {
      this.isUserLoggedIn = true;
      this.getCollections(this.collectionId);
      const user = JSON.parse(this.winServ.getLocalItem('userData'));
      this.userData = user;
      this.userPlanDetails = user.user_plan_details ? user.user_plan_details : {};
      if (user) {
        const planDetails = this.userData['user_plan_details'];
        if (planDetails && planDetails.facilities) {
          this.planFacilities = planDetails.facilities;
        }
        if (planDetails && planDetails.facilitiesToolTip) {
          this.planfacilitiesToolTip = planDetails.facilitiesToolTip;
        }
      }
    }
  }
  SelectText(element) {
    if (window.getSelection) {
      const selection = window.getSelection();
      const range: any = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
      return true;
    } else {
      return false;
    }
  }
  copyImage(ele) {
    const _that = this;
    const element = $('body').find(ele);
    element.attr('contenteditable', 'true');
    if (element.get(0)) {
      try {
        const success = document.execCommand('copy');
        if (success) {
        } else {
          throw new Error('Error while copying image!');
        }
        window.getSelection().removeAllRanges();
        $(ele).removeAttr('contenteditable');
        this.imageCollectionalert('Copied!', 'Image copied to clipboard.', 'success');
      } catch (error) {
        console.log(error);
        this.imageCollectionalert('Error!', error.responseText, 'error');
      }
    } else {
      this.imageCollectionalert('Error!', 'Unable to find image.', 'error');
    }
  }
  purchaseCollection(id) {
    const token = this.winServ.getLocalItem('token');
    if (!token) {
      this.imageCollectionalert('Error!', 'You need to login to purchase', 'error');
      return;
    }
    let totalImages = this.collectionImages.length;
    let totalDiscount = 0;
    let totalCost = 0;
    const discount =
      this.userPlanDetails &&
      this.userPlanDetails.facilities &&
      this.userPlanDetails.facilities.collectionDiscount
        ? parseInt(this.userPlanDetails.facilities.collectionDiscount, 10)
        : 0;

    if (this.userData.is_download == '0') {
      this.purchaseThisCollection(id, token, discount);
    } else {
      for (let index = 0; index < totalImages; index++) {
        const element = this.collectionImages[index];
        if (element.isPurchased != 1) {
          totalCost += parseInt(
            element.type == 1 ? element.model_price_credits || 0 : element.price_credits || 0
          );
        }
      }
      totalDiscount = Math.floor((totalCost / 100) * discount);
      totalCost = totalCost - totalDiscount;
      let message =
        '<div class="purchase-collection-confirm" style="padding: 30px 35px 0;"><div><p>Purchase all Images/Models <font class="light-text" > (' +
        totalImages +
        ') </font> in this Collection?</p> <br><p>Discount: <b class="bold"> <font class="text-blue" > ' +
        totalDiscount +
        ' </font> Credits</b> </p><p> Total Cost: <b class="bold"> <font class="text-blue" > ' +
        totalCost +
        ' </font> Credits</b></p><br /><p class="info-text light-text" > (Content already owned won\'t be charged again)</p><br /></div></div>';
      this.showAlert('Purchase Collection', message, 'info', 'Confirm', 'Cancel', true).then(
        result => {
          if (result.value) {
            this.purchaseThisCollection(id, token, discount);
          }
        }
      );
    }
  }
  purchaseThisCollection(id, token, discount) {
    this.purchasingCollection = true;
    this.comServ
      .post('webservices/purchaseCollectionImages', {
        id: id,
        token: token,
        discount: discount
      })
      .subscribe(data => {
        if (data.status) {
          switch (data.status) {
            case 200:
              this.getCollections(id);
              this.$header.updateUserData();
              this.imageCollectionalert('Success!', data.message, 'success');
              break;
            case 400:
              this.imageCollectionalert('Error!', data.message, 'error');
              break;
            case 403:
              this.imageCollectionalert('Error!', data.message, 'error');
              break;
            case 404:
              this.imageCollectionalert('Error!', data.message, 'error');
              break;
            case 500:
              this.imageCollectionalert('Error!', data.message, 'error');
              break;
            case 503:
              const _that = this;
              this.showAlert('Oops..', data.message, 'warning', 'Add Credits', 'Cancel').then(
                function(result) {
                  if (result.value) {
                    _that.$header.getAndUpdateCustomCredits();
                    const ele = $('body').find('#add-credit-modal-btn');
                    if (ele[0]) {
                      ele[0].click();
                    }
                  }
                }
              );
              break;
            default:
              this.imageCollectionalert(
                'Error!',
                'An unknown error occure while purchasing pack.',
                'error'
              );
              break;
          }
        }
        this.purchasingCollection = false;
      });
  }
  zoomImage(id, event) {
    setTimeout(function() {
      this.zoomThisImage(id, event);
    }, 0);
  }
  replacePreviews(string: string, search: string, replace: string) {
    return string.replace(search, replace);
  }
  onlyPurchaseThisImage(index) {
    const remainingCredits = this.userData['remainingCredits']
      ? this.userData['remainingCredits']
      : 0;
    const $image = this.collectionImages[index];
    const price_credits = this.collectionImages[index].price_credits;
    if ($image.isPurchased == 1) {
      this.imageCollectionalert('Error!', 'You have already purchased this image.', 'error');
      return;
    }
    if (parseInt(price_credits, 10) > parseInt(remainingCredits, 10)) {
      const _that = this;
      this.showAlert(
        'Oops..',
        '<div class="credit-spend-confirm text-left clearfix"><p>You do not have enough <b>Credits</b></p><p>Would you like to add some?</p></div>',
        'warning',
        'Add Credits',
        'Cancel'
      ).then(function(result) {
        if (result.value) {
          _that.$header.getAndUpdateCustomCredits();
          const ele = $('body').find('#add-credit-modal-btn');
          if (ele[0]) {
            ele[0].click();
          }
        }
      });
      return;
    }
    if (this.userData['is_download'] == '0') {
      this.userData['is_download'] = 0;
      this.onlyPurchaseImage($image, this.winServ.getLocalItem('token'), 1);
    } else {
      const message =
        '<div class="credit-spend-confirm text-left"><p>You are about to spend <span class="text-blue">' +
        price_credits +
        '</span> credits.</p><p>Are you sure ?</p><div class="alert-stop-confirm"><div class="checkbox checkbox-white "><input type="checkbox" class="do-not-show-img-purchase" id="do-not-show-img-purchase"/> <label for="do-not-show-img-purchase">Don\'t show this again.</label></div></div></div>';
      const _that = this;
      const alertRes = this.showAlert('Confirmation', message, 'success', 'OK', 'Cancel');
      alertRes.then(result => {
        if (result.value) {
          const hideConfirm = _that.winServ.getLocalItem('hideImageConfirm') ? true : false;
          _that.userData['is_download'] = hideConfirm ? 0 : 1;
          _that.onlyPurchaseImage($image, _that.winServ.getLocalItem('token'), hideConfirm);
          _that.winServ.removeItem('hideImageConfirm');
        } else {
          _that.downloadingImage = false;
        }
      });
    }
  }
  onlyPurchaseImage(imageDetails, token, hideConfirm) {
    const index = this.collectionImages.findIndex(d => d.image_id == imageDetails.image_id);
    if (index > -1) {
      this.isPreviewLoaded[index] = false;
    }
    this.purchaseImageReq = this.imageSer
      .purchaseImageByCredits(imageDetails.image_id, token, imageDetails.price_credits, hideConfirm)
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                if (index > -1) {
                  this.collectionImages[index].isPurchased = 1;
                  this.isPreviewLoaded[index] = false;
                  this.getMainImage(index);
                }
                this.$header.updateUserData();
                this.imageCollectionalert('Success!', data.message, 'success');
                this.downloadingImage = false;
                break;
              case 204:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 400:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 401:
                const _that = this;
                this.showAlert('Oops..', data.message, 'warning', 'Add Credits', 'Cancel').then(
                  function(result) {
                    if (result.value) {
                      _that.$header.getAndUpdateCustomCredits();
                      const ele = $('body').find('#add-credit-modal-btn');
                      if (ele[0]) {
                        ele[0].click();
                      }
                    }
                  }
                );
                this.downloadingImage = false;
                break;
              case 403:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 404:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 500:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              default:
                this.imageCollectionalert(
                  'Error!',
                  'An unknown error occure, please try after some time.',
                  'error'
                );
                this.downloadingImage = false;
                break;
            }
          }
        },
        err => {
          console.log(err);
          this.imageCollectionalert(
            'Error!',
            'An unknown error occure, please try after some time.',
            'error'
          );
          this.downloadingImage = false;
        }
      );
  }
  downloadImage(index, selected) {
    if (!selected || selected == 'original') {
      this.downloadThisImage(index, 'width', 'height', false);
    } else if (selected == 'large') {
      this.downloadThisImage(index, 'large_width', 'large_height', false);
    } else if (selected == 'medium') {
      this.downloadThisImage(index, 'medium_width', 'medium_height', false);
    } else if (selected == 'small') {
      this.downloadThisImage(index, 'small_width', 'small_height', false);
    } else if (selected == 'custom') {
      this.downloadThisImage(index, 'custom_width', 'custom_height', false);
    }
  }
  encodeToURL(str) {
    return encodeURIComponent(str);
  }

  // onlyPurchaseThisModel(modelData) {
  //   let remainingCredits = this.userData.remainingCredits
  //     ? this.userData.remainingCredits
  //     : 0;
  //   let $image = modelData;
  //   let price_credits = modelData.price_credits;
  //   if ($image.isPurchased == 1) {
  //     this.imageCollectionalert(
  //       'Error!',
  //       'You have already purchased this image',
  //       'error',
  //     );
  //     return;
  //   }
  //   if (parseInt(price_credits) > parseInt(remainingCredits)) {
  //     let _that = this;
  //     this.showAlert(
  //       'Oops..',
  //       '<div class="credit-spend-confirm text-left clearfix"><p>You do not have enough <b>Credits</b></p><p>Would you like to add some?</p></div>',
  //       'warning',
  //       'Add Credits',
  //       'Cancel',
  //     ).then(function(result) {
  //       if (result.value) {
  //         const updateServ = new UpdateService();
  //         updateServ.getAndUpdatingCustomerCredits('yes');
  //         // _that.$header.getAndUpdateCustomCredits();
  //         let ele = $('body').find('#add-credit-modal-btn');
  //         if (ele[0]) {
  //           ele[0].click();
  //         }
  //       }
  //     });
  //     return;
  //   }
  //   if (this.userData.is_download == '0') {
  //     this.userData.is_download = 0;
  //     this.onlyPurchaseImage($image, this.winServ.getLocalItem('token'), 1);
  //   } else {
  //     let message =
  //       '<div class="credit-spend-confirm text-left"><p>You are about to spend <span class="text-blue">' +
  //       price_credits +
  //       '</span> <b class="bold">Credits</b>.</p><p>Are you sure ?</p><div class="alert-stop-confirm"><div class="checkbox checkbox-white "><input type="checkbox" class="do-not-show-img-purchase" id="do-not-show-img-purchase"/> <label for="do-not-show-img-purchase">Don\'t show this again.</label></div></div></div>';
  //     let _that = this;
  //     let alertRes = this.showAlert(
  //       'Confirmation',
  //       message,
  //       'success',
  //       'OK',
  //       'Cancel',
  //     );
  //     alertRes.then(result => {
  //       if (result.value) {
  //         let hideConfirm = _that.winServ.getLocalItem('hideImageConfirm')
  //           ? true
  //           : false;
  //         _that.userData.is_download = hideConfirm ? 0 : 1;
  //         _that.onlyPurchaseImage(
  //           $image,
  //           _that.winServ.getLocalItem('token'),
  //           hideConfirm,
  //         );
  //         _that.winServ.removeItem('hideImageConfirm');
  //       } else {
  //         _that.downloadingImage = false;
  //       }
  //     });
  //   }
  // }

  // downloadThisModel(index) {
  //   if (this.collectionImages[index].isPurchased == '0') {
  //     this.showAlert(
  //       'Oops..',
  //       '<div class="credit-spend-confirm text-left clearfix"><p>Please purchase this Model first.</p></div>',
  //       'warning',
  //       'Purchase Model',
  //       'Cancel',
  //     )
  //   } else {
  //     var modelId = this.collectionImages[index].model_id;
  //     var token = this.winServ.getLocalItem('token');
  //     this.comServ
  //       .get('webservices/downloadModel', { token: token, modelId })
  //       .subscribe(res => {
  //         this.downloadUrl = res.url;
  //         this.downloadImageName = Math.random().toString();
  //         let img = $('body .downloadImg');
  //         if (img && img[0]) {
  //           setTimeout(() => {
  //             img[0].click();
  //             this.downloadingImage = false;
  //           }, 1000);
  //         }
  //       });
  //   }
  // }

  onlyPurchaseThisModel(modelData, ext) {
    let remainingCredits = this.userData.remainingCredits ? this.userData.remainingCredits : 0;
    let $image = modelData;
    let price_credits = modelData.price_credits;
    if ($image.isPurchased == 1) {
      this.imageCollectionalert('Error!', 'You have already purchased this image.', 'error');
      return;
    }
    if (parseInt(price_credits) > parseInt(remainingCredits)) {
      let _that = this;
      this.showAlert(
        'Oops..',
        '<div class="credit-spend-confirm text-left clearfix"><p>You do not have enough <b>Credits</b></p><p>Would you like to add some?</p></div>',
        'warning',
        'Add Credits',
        'Cancel'
      ).then(function(result) {
        if (result.value) {
          const updateServ = new UpdateService();
          updateServ.getAndUpdatingCustomerCredits('yes');
          // _that.$header.getAndUpdateCustomCredits();
          let ele = $('body').find('#add-credit-modal-btn');
          if (ele[0]) {
            ele[0].click();
          }
        }
      });
      return;
    }
    if (this.userData.is_download == '0') {
      this.userData.is_download = 0;
      this.onlyPurchaseModel($image, this.winServ.getLocalItem('token'), 1, ext);
    } else {
      let message =
        '<div class="credit-spend-confirm text-left"><p>You are about to spend <span class="text-blue">' +
        price_credits +
        '</span> <b class="bold">Credits</b>.</p><p>Are you sure ?</p><div class="alert-stop-confirm"><div class="checkbox checkbox-white "><input type="checkbox" class="do-not-show-img-purchase" id="do-not-show-img-purchase"/> <label for="do-not-show-img-purchase">Don\'t show this again.</label></div></div></div>';
      let _that = this;
      let alertRes = this.showAlert('Confirmation', message, 'success', 'OK', 'Cancel');
      alertRes.then(result => {
        if (result.value) {
          let hideConfirm = _that.winServ.getLocalItem('hideImageConfirm') ? true : false;
          _that.userData.is_download = hideConfirm ? 0 : 1;
          _that.onlyPurchaseModel($image, _that.winServ.getLocalItem('token'), hideConfirm, ext);
          _that.winServ.removeItem('hideImageConfirm');
        } else {
          _that.downloadingImage = false;
        }
      });
    }
  }

  onlyPurchaseModel(imageDetails, token, hideConfirm, ext) {
    let index = this.collectionImages.findIndex(d => d.model_id == imageDetails.model_id);
    if (index > -1) {
      this.isPreviewLoaded[index] = false;
      this.collectionImages[index].image_thumbnail_main =
        this.ServerImgPath + this.collectionImages[index].image_thumbnail;
      // this.Images[index].image_thumbnail_main = this.ServerImgPath + this.Images[index].image_thumbnail;
    }
    this.purchaseImageReq = this.modelService
      .purchaseModelByCredits(
        imageDetails.model_id,
        token,
        imageDetails.model_price_credits,
        hideConfirm
      )
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                if (index > -1) {
                  this.collectionImages[index].isPurchased = 1;

                  if (ext) {
                    // after successfull purchase download the image
                    this.downloadingImage = true;
                    let modelName = this.collectionImages[index].model_name;
                    var modelId = this.collectionImages[index].model_id;
                    this.downloadReq = this.comServ
                      .get('webservices/downloadModel', {
                        token: token,
                        modelId,
                        ext
                      })
                      .subscribe(data => {
                        if (data.status) {
                          switch (data.status) {
                            case 200:
                              if (data && data.url) {
                                this.downloadUrl = data.url;
                                this.downloadImageName = data.model_name;
                                let img = $('body .downloadImg');
                                if (img && img[0]) {
                                  setTimeout(() => {
                                    img[0].click();
                                    this.updateService.updatingUserData('yes');
                                    // this.$header.updateUserData();
                                    this.downloadingImage = false;

                                    // $('#' + `remove-ele-${index}`).spritespin({
                                    //   source: this.collectionImages[index].preview,
                                    //   width: 550, // width of image
                                    //   height: 550 / data.data.ratio, // heignt of image
                                    //   sense: -1, // touch sesivity
                                    //   senseLane: -1,
                                    //   animate: true, // auto rotate or manual
                                    //   loop: true, // whether to loop animation
                                    //   frameTime: 100 // animation speed
                                    // });
                                  }, 100);
                                } else {
                                  // swal('Error!', 'An error occure while downloading image.', 'error');
                                  this.imageCollectionalert(
                                    'Error!',
                                    'An error occure while downloading model.',
                                    'error'
                                  );
                                  this.downloadingImage = false;
                                }
                              }
                              break;
                            default:
                              this.selectedSize = [];
                              this.imageCollectionalert(
                                'Error!',
                                'An unknown error occure while downloading model.',
                                'error'
                              );
                              this.downloadingImage = false;
                              break;
                          }
                        }
                      });
                  }
                }
                this.updateService.updatingUserData('yes');
                // this.$header.updateUserData();
                this.imageCollectionalert('Success!', data.message, 'success');
                this.downloadingImage = false;
                break;
              case 204:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 400:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 401:
                let _that = this;
                this.showAlert('Oops..', data.message, 'warning', 'Add Credits', 'Cancel').then(
                  function(result) {
                    if (result.value) {
                      const updateServ = new UpdateService();
                      updateServ.getAndUpdatingCustomerCredits('yes');
                      // _that.$header.getAndUpdateCustomCredits();
                      let ele = $('body').find('#add-credit-modal-btn');
                      if (ele[0]) {
                        ele[0].click();
                      }
                    }
                  }
                );
                this.downloadingImage = false;
                break;
              case 403:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 404:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              case 500:
                this.imageCollectionalert('Error!', data.message, 'error');
                this.downloadingImage = false;
                break;
              default:
                this.imageCollectionalert(
                  'Error!',
                  'An unknown error occure, please try after some time.',
                  'error'
                );
                this.downloadingImage = false;
                break;
            }
          }
        },
        err => {
          this.imageCollectionalert(
            'Error!',
            'An unknown error occure, please try after some time.',
            'error'
          );
          this.downloadingImage = false;
        }
      );
  }
  downloadThisModel(index, ext) {
    let remainingCredits = this.userData.remainingCredits ? this.userData.remainingCredits : 0;
    let $image = this.collectionImages[index];
    let ratio = this.collectionImages[index].ratio;
    let price_credits = this.collectionImages[index].model_price_credits;
    if (
      parseInt(price_credits) > parseInt(remainingCredits) &&
      !this.collectionImages[index].isPurchased
    ) {
      let _that = this;
      this.showAlert(
        'Oops..',
        '<div class="credit-spend-confirm text-left clearfix"><p>You do not have enough <b>Credits</b></p><p>Would you like to add some?</p></div>',
        'warning',
        'Add Credits',
        'Cancel'
      ).then(function(result) {
        if (result.value) {
          _that.updateService.getAndUpdatingCustomerCredits('yes');
          // _that.$header.getAndUpdateCustomCredits();
          let ele = $('body').find('#add-credit-modal-btn');
          if (ele[0]) {
            ele[0].click();
          }
        }
      });
      return;
    }
    let token = this.winServ.getLocalItem('token');
    if (!token) {
      this.imageCollectionalert('Info!', 'You need to login to download model.', 'info');
    }
    this.downloadingImage = true;
    let modelName = this.collectionImages[index].model_name;
    var modelId = this.collectionImages[index].model_id;
    this.downloadReq = this.comServ
      .get('webservices/downloadModel', { token: token, modelId, ext })
      .subscribe(
        data => {
          if (data.status) {
            switch (data.status) {
              case 200:
                if (data && data.url) {
                  this.downloadUrl = data.url;
                  this.downloadImageName = data.model_name;
                  let img = $('body .downloadImg');
                  if (img && img[0]) {
                    setTimeout(() => {
                      img[0].click();
                      this.updateService.updatingUserData('yes');
                      // this.$header.updateUserData();
                      this.downloadingImage = false;
                    }, 1000);
                  } else {
                    // swal('Error!', 'An error occure while downloading image.', 'error');
                    this.imageCollectionalert(
                      'Error!',
                      'An error occure while downloading image.',
                      'error'
                    );
                    this.downloadingImage = false;
                  }
                } else {
                  // swal('Error!', 'Invalid image download request', 'error');
                  this.imageCollectionalert(
                    'Error!',
                    data.message
                      ? data.message
                      : 'An unknown error occure while downloading image.',
                    'error'
                  );
                  this.downloadingImage = false;
                }
                break;
              case 401:
                // swal('Error!', 'You need to purchase image to download this image.', 'error');
                if (data.isHideConfirm == true) {
                  this.onlyPurchaseThisModel($image, ext);
                } else {
                  let message =
                    '<div class="credit-spend-confirm text-left"><p>You are about to spend <span class="text-blue">' +
                    price_credits +
                    '</span> <b class="bold">Credits</b>.</p><p>Are you sure ?</p><div class="alert-stop-confirm"><div class="checkbox checkbox-white "><input type="checkbox" class="do-not-show-img-purchase" id="do-not-show-img-purchase"/> <label for="do-not-show-img-purchase">Don\'t show this again.</label></div></div></div>';
                  let _that = this;
                  let alertRes = this.showAlert('Confirmation', message, 'success', 'OK', 'Cancel');
                  alertRes.then(result => {
                    if (result.value) {
                      let hideConfirm = _that.winServ.getLocalItem('hideImageConfirm')
                        ? true
                        : false;
                      _that.onlyPurchaseThisModel($image, ext);
                      _that.winServ.removeItem('hideImageConfirm');
                    } else {
                      _that.downloadingImage = false;
                    }
                  });
                }
                break;
              case 400:
                // swal('Error!', data.error_message, 'error');
                this.imageCollectionalert('Error!', data.error_message, 'error');
                this.downloadingImage = false;
                break;
              default:
                // swal('Error!', 'An unknown error occure while downloading image.', 'error');
                this.selectedSize = [];
                this.imageCollectionalert(
                  'Error!',
                  'An unknown error occure while downloading image.',
                  'error'
                );
                this.downloadingImage = false;
                break;
            }
          }
        },
        err => {
          // swal('Error!', 'An unknown error occure while downloading image.', 'error');
          this.selectedSize = [];
          this.imageCollectionalert(
            'Error!',
            'An unknown error occure while downloading image.',
            'error'
          );
          this.downloadingImage = false;
        }
      );
  }

  ngOnDestroy() {
    if (this.getCollectionReq) {
      this.getCollectionReq.unsubscribe();
    }
    if (this.addCollectionReq) {
      this.addCollectionReq.unsubscribe();
    }
    if (this.renameCollectionReq) {
      this.renameCollectionReq.unsubscribe();
    }
    if (this.deleteCollectionReq) {
      this.deleteCollectionReq.unsubscribe();
    }
    if (this.routerEvent) {
      this.routerEvent.unsubscribe();
    }
    if (this.queryParamEvent) {
      this.queryParamEvent.unsubscribe();
    }
  }
  /**
   *
   */
  showActualOption = (): boolean => {
    return (
      this.userData &&
      this.userData.user_plan_details &&
      (this.userData.user_plan_details.subscriptionStatus == 1 ||
        this.userData.user_plan_details.subscriptionStatus == 2)
    );
  };
}
