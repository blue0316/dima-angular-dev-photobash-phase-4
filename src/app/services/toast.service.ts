import { Injectable } from '@angular/core';
declare const $: any;
@Injectable()
export class ToastService {

  constructor() { }
  showNotification(message: string, type: string = null, from: string = 'top', align: string = 'right') {
    const types = ['', 'info', 'success', 'warning', 'danger', 'rose', 'primary'];
    const color = Math.floor((Math.random() * 6) + 1);
    // $.notify({
    //   icon: 'notifications',
    //   message: message
    // }, {
    //   type: type ? type : types[color],
    //   timer: 3000,
    //   placement: {
    //     from: from,
    //     align: align
    //   }
    // });
  }
}
