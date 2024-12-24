import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from "@angular/forms";

@Directive({
  selector: '[ngModel][onlyNumbers]'
})
export class OnlyNumbersDirective {

  constructor(private el: ElementRef, public model: NgControl) { }
  @HostListener('input', ['$event']) onEvent($event: any) {
    let value = this.el.nativeElement.value;
    let newVal = null;
    if (value) {
      newVal = parseInt(value);
    }
    if (newVal<=0) {
      newVal = newVal;
    }
    this.model.control.setValue(newVal);
  }
}