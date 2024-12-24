import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsToTime',
  pure: false
})
export class SecondsToTimePipe implements PipeTransform {

  times = {
   // day: 86400,
    hr: 3600,
    min: 60,
    sec: 1
  }
  transform(seconds) {
    let time_string: string = '';
    let plural: string = '';
    for (var key in this.times) {
      let timeData = Math.floor(seconds / this.times[key]);
      let tempTime = timeData.toString();
      if(timeData<10){
        tempTime = '0' + timeData;
      }
      time_string += tempTime;
      if (key == 'day') {
        if (timeData<10) {
          time_string += ' Day';
        }else{
          time_string += ' Days';
        }
      }else if (key !='sec'){
        time_string +=':';
      }else{
        time_string += '';
        //time_string += ' HR';
      }
      seconds = seconds - this.times[key] * Math.floor(seconds / this.times[key]);
    }
    return time_string;
  }
}