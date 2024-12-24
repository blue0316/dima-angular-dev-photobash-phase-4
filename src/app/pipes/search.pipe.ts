import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search',
  pure: false
})
export class SearchPipe implements PipeTransform {

  transform(item: any, keys: any, val: string, uniqueKey: string): any {
    if (!item) {
      return [];  
    }
    if (!keys) {
      return item;
    }
    if (!val) {
      return item;
    }
    if (!val) {
      return item;
    }
    let returnItem = [];
    val = val.trim().toLowerCase();
    for (let index = 0; index < item.length; index++) {
      const ele = item[index];
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        let tempIndex = returnItem.findIndex( d => d[uniqueKey]==ele[uniqueKey]);
        if (tempIndex == -1 && ele[key] && ele[key].toLowerCase().indexOf(val)>-1) {
          returnItem.push(ele);
        }
      }
    }
    console.log('Search Completed');
    return returnItem;
  }
}
