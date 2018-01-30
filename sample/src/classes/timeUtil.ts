export class TimeUtil {

  getGMTtimeInMilliseconds(time:string){
      let year=parseInt(time.substr(0,4));
      let month=parseInt(time.substr(5,2))-1;
      let day=parseInt(time.substr(8,2));
      let hours=parseInt(time.substr(11,2));
      let minutes=parseInt(time.substr(14,2));
      let seconds=parseInt(time.substr(17,2));
      var d=Date.UTC(year, month, day, hours, minutes, seconds);
      return d;
  }

  dayInKoreanNumber(day){  //please use moment or other library for langauge later
    switch(day){
      case  0: return '일요일';
      case  1: return '월요일';
      case  2: return '화요일';
      case  3: return '수요일';
      case  4: return '목요일';
      case  5: return '금요일';
      case  6: return '토요일';
    }
  }

  getlocalTimeString(string){
    let d=new Date(this.getGMTtimeInMilliseconds(string));
    //console.log("date:"+d.getDay());
    let month=d.getMonth()+1;
    let monthStr=(month <= 9 ? '0': '') + (month);
    let day=d.getDate();
    let dayStr=(day <= 9 ? '0': '') + (day);
    let hour=d.getHours();
    let hourStr=(hour <= 9 ? '0': '') + (hour);
    let min=d.getMinutes();
    let minStr=(min <= 9 ? '0': '') + (min);
    let localTimeString=d.getFullYear()+"/"+monthStr+"/"+dayStr+" "+this.dayInKoreanNumber(d.getDay())+" "+hourStr+":"+minStr;
    console.log("localTimeString:"+localTimeString);
    return localTimeString;
  }

  getlocalTimeStringWithoutDay(string){
    let d=new Date(this.getGMTtimeInMilliseconds(string));
    //console.log("date:"+d.getDay());
    let month=d.getMonth()+1;
    let monthStr=(month <= 9 ? '0': '') + (month);
    let day=d.getDate();
    let dayStr=(day <= 9 ? '0': '') + (day);
    let hour=d.getHours();
    let hourStr=(hour <= 9 ? '0': '') + (hour);
    let min=d.getMinutes();
    let minStr=(min <= 9 ? '0': '') + (min);
    let fullYear:string=d.getFullYear().toString();
    let localTimeString=fullYear.substr(2,2)+"/"+monthStr+"/"+dayStr+" "+hourStr+":"+minStr;
    console.log("getlocalTimeStringWithoutDay:"+localTimeString);
    return localTimeString;
  }
}



