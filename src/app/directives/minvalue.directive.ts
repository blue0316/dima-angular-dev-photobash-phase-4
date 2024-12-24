import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from "@angular/forms";

@Directive({
  selector: '[ngModel][minvalue]'
})
export class MinvalueDirective {

  constructor(private el: ElementRef, public model: NgControl) {}
  @HostListener('change', ['$event']) onEvent($event: any) {
    const value = this.el.nativeElement.value;
    const defaultVal = 5;
    const defaultMaxVal = 250;
    let newVal = null;
    if (value) {
      newVal = parseInt(value);
    } else {
      newVal = defaultVal;
    }
    if (newVal <= defaultVal) {
      newVal = defaultVal;
    } else if (newVal >= defaultMaxVal) {
      newVal = 250;
    } else {
      newVal = newVal;
    }
    if (Number.isNaN(newVal) || newVal == '') {
      newVal = 5;
    }
    this.model.control.setValue(newVal);
  }
}
