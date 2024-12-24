import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'orderBy',
	pure: false
})
export class OrderByPipe implements PipeTransform {
  transform(array: Array<string>, args: string): any {
  	array.sort((a: any, b: any) => {
	    let firstEle = (typeof a[args] == "string") ? a[args].toLowerCase() : a[args];
	    let secondEle = (typeof b[args] == "string") ? b[args].toLowerCase() : b[args];
	    if (firstEle <  secondEle){
	    	return -1;
	    }else if( firstEle > secondEle ){
	        return 1;
	    }else{
	    	return 0;	
	    }
    });
    return array;
  }
}
