import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,Platform } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {TimeUtil} from '../../classes/TimeUtil';

/**
 * Generated class for the ShoptablePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-shoptable',
  templateUrl: 'shoptable.html',
})
export class ShoptablePage {
  Option="today";
  startDate;
  endDate;
  
  storeColor="#33b9c6";
  notiColor="#33b9c6";
  printColor="#33b9c6";

  timeUtil= new TimeUtil(); 

  column=1; //default value

  orders=[{"orderId":"1548","takitId":"세종대@더큰도시락","shopName":"더큰도시락","orderName":"돈까스도시락(1)","payMethod":"cash","amount":"3298","takeout":"0","arrivalTime":null,"orderNO":"9","userId":"239","userName":"정권준","userPhone":"01048400922","orderStatus":"paid","orderList":"{\"takitId\":\"세종대@더큰도시락\",\"menus\":[{\"menuNO\":\"세종대@더큰도시락;1\",\"menuName\":\"돈까스도시락\",\"quantity\":1,\"options\":[],\"price\":3400,\"unitPrice\":3400,\"takeout\":\"1\",\"amount\":3298}]}","deliveryAddress":null,"userMSG":null,"orderedTime":"2018-02-09 04:52:57","checkedTime":"2018-02-09 04:53:19","completedTime":"2018-02-09 04:53:24","cancelledTime":"2018-02-09 04:54:15","localCancelledTime":"0000-00-00 00:00:00","cancelReason":"기타-상세미입력","localOrderedTime":"2018-02-09 13:52:57","localOrderedDay":"5","localOrderedHour":"13","localOrderedDate":"2018-02-09","receiptIssue":"1","receiptId":"01048400922","receiptType":"IncomeDeduction","imp_uid":null,"approval":null,"card_info":null,"deliveryFee":null,"pickupTime":"2018-02-09 04:53:30","starRate":null,"review":null,"statusString":"취소","hidden":false,"orderListObj":{"takitId":"세종대@더큰도시락","menus":[{"menuNO":"세종대@더큰도시락;1","menuName":"돈까스도시락","quantity":1,"options":[],"price":3400,"unitPrice":3400,"takeout":"1","amount":3298}]},"userPhoneHref":"tel:01048400922","cancelReasonString":"기타-상세미입력"}]; 
  
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public platform: Platform,
              public storageProvider:StorageProvider) {
    platform.ready().then(() => {
      console.log('Width: ' + platform.width());
      console.log('Height: ' + platform.height());
      if(platform.width()/2>380){
          // hum... display two columns 
          this.column=2;
      }else{
          // display one columns
          this.column=1;
      }
    });

    var date=new Date();
    var month=date.getMonth()+1;

    this.startDate=this.getTodayString();
    this.endDate=this.getTodayString();

    console.log("startDate:"+this.startDate);
    console.log("endDate:"+this.endDate);

    if(this.storageProvider.myshop.GCMNoti=="off"){
      this.notiColor="gray";
    }else if(this.storageProvider.myshop.GCMNoti=="on"){
      this.notiColor="#33b9c6";
    }else{
      console.log("unknown GCMNoti");
    }

    if(this.storageProvider.storeOpen==true)
      this.storeColor="#33b9c6";
    else 
      this.storeColor="gray";  

   /////////////////////////////////////////////////
//   this.orders.push({"orderId":"1548","takitId":"세종대@더큰도시락","shopName":"더큰도시락","orderName":"돈까스도시락(1)","payMethod":"cash","amount":"3298","takeout":"0","arrivalTime":null,"orderNO":"9","userId":"239","userName":"정권준","userPhone":"01048400922","orderStatus":"cancelled","orderList":"{\"takitId\":\"세종대@더큰도시락\",\"menus\":[{\"menuNO\":\"세종대@더큰도시락;1\",\"menuName\":\"돈까스도시락\",\"quantity\":1,\"options\":[],\"price\":3400,\"unitPrice\":3400,\"takeout\":\"1\",\"amount\":3298}]}","deliveryAddress":null,"userMSG":null,"orderedTime":"2018-02-09 04:52:57","checkedTime":"2018-02-09 04:53:19","completedTime":"2018-02-09 04:53:24","cancelledTime":"2018-02-09 04:54:15","localCancelledTime":"0000-00-00 00:00:00","cancelReason":"기타-상세미입력","localOrderedTime":"2018-02-09 13:52:57","localOrderedDay":"5","localOrderedHour":"13","localOrderedDate":"2018-02-09","receiptIssue":"1","receiptId":"01048400922","receiptType":"IncomeDeduction","imp_uid":null,"approval":null,"card_info":null,"deliveryFee":null,"pickupTime":"2018-02-09 04:53:30","starRate":null,"review":null,"statusString":"취소","hidden":false,"orderListObj":{"takitId":"세종대@더큰도시락","menus":[{"menuNO":"세종대@더큰도시락;1","menuName":"돈까스도시락","quantity":1,"options":[],"price":3400,"unitPrice":3400,"takeout":"1","amount":3298}]},"userPhoneHref":"tel:01048400922","cancelReasonString":"기타-상세미입력"}); 
   this.orders.push({"orderId":"1548","takitId":"세종대@더큰도시락","shopName":"더큰도시락","orderName":"돈까스도시락(1)","payMethod":"cash","amount":"3298","takeout":"1","arrivalTime":null,"orderNO":"9","userId":"239","userName":"정권준","userPhone":"01048400922","orderStatus":"checked","orderList":"{\"takitId\":\"세종대@더큰도시락\",\"menus\":[{\"menuNO\":\"세종대@더큰도시락;1\",\"menuName\":\"돈까스도시락\",\"quantity\":1,\"options\":[],\"price\":3400,\"unitPrice\":3400,\"takeout\":\"1\",\"amount\":3298}]}","deliveryAddress":null,"userMSG":"소스 많이 주세요.","orderedTime":"2018-02-09 04:52:57","checkedTime":"2018-02-09 04:53:19","completedTime":"2018-02-09 04:53:24","cancelledTime":"2018-02-09 04:54:15","localCancelledTime":"0000-00-00 00:00:00","cancelReason":"기타-상세미입력","localOrderedTime":"2018-02-09 13:52:57","localOrderedDay":"5","localOrderedHour":"13","localOrderedDate":"2018-02-09","receiptIssue":"1","receiptId":"01048400922","receiptType":"IncomeDeduction","imp_uid":null,"approval":null,"card_info":null,"deliveryFee":null,"pickupTime":"2018-02-09 04:53:30","starRate":null,"review":null,"statusString":"취소","hidden":false,"orderListObj":{"takitId":"세종대@더큰도시락","menus":[{"menuNO":"세종대@더큰도시락;1","menuName":"돈까스도시락","quantity":1,"options":[],"price":3400,"unitPrice":3400,"takeout":"1","amount":3298}]},"userPhoneHref":"tel:01048400922","cancelReasonString":"기타-상세미입력"}); 

   this.orders.push({"orderId":"1548","takitId":"세종대@더큰도시락","shopName":"더큰도시락","orderName":"돈까스도시락(1)","payMethod":"cash","amount":"3298","takeout":"2","arrivalTime":null,"orderNO":"9","userId":"239","userName":"정권준","userPhone":"01048400922","orderStatus":"completed","orderList":"{\"takitId\":\"세종대@더큰도시락\",\"menus\":[{\"menuNO\":\"세종대@더큰도시락;1\",\"menuName\":\"돈까스도시락\",\"quantity\":1,\"options\":[],\"price\":3400,\"unitPrice\":3400,\"takeout\":\"1\",\"amount\":3298}]}","deliveryAddress":"충무관 105호","userMSG":null,"orderedTime":"2018-02-09 04:52:57","checkedTime":"2018-02-09 04:53:19","completedTime":"2018-02-09 04:53:24","cancelledTime":"2018-02-09 04:54:15","localCancelledTime":"0000-00-00 00:00:00","cancelReason":"기타-상세미입력","localOrderedTime":"2018-02-09 13:52:57","localOrderedDay":"5","localOrderedHour":"13","localOrderedDate":"2018-02-09","receiptIssue":"1","receiptId":"01048400922","receiptType":"IncomeDeduction","imp_uid":null,"approval":null,"card_info":null,"deliveryFee":null,"pickupTime":"2018-02-09 04:53:30","starRate":null,"review":null,"statusString":"취소","hidden":false,"orderListObj":{"takitId":"세종대@더큰도시락","menus":[{"menuNO":"세종대@더큰도시락;1","menuName":"돈까스도시락","quantity":1,"options":[],"price":3400,"unitPrice":3400,"takeout":"1","amount":3298}]},"userPhoneHref":"tel:01048400922","cancelReasonString":"기타-상세미입력"}); 
   this.orders.push({"orderId":"1548","takitId":"세종대@더큰도시락","shopName":"더큰도시락","orderName":"돈까스도시락(1)","payMethod":"cash","amount":"3298","takeout":"0","arrivalTime":null,"orderNO":"9","userId":"239","userName":"정권준","userPhone":"01048400922","orderStatus":"pickup","orderList":"{\"takitId\":\"세종대@더큰도시락\",\"menus\":[{\"menuNO\":\"세종대@더큰도시락;1\",\"menuName\":\"돈까스도시락\",\"quantity\":1,\"options\":[],\"price\":3400,\"unitPrice\":3400,\"takeout\":\"1\",\"amount\":3298}]}","deliveryAddress":null,"userMSG":null,"orderedTime":"2018-02-09 04:52:57","checkedTime":"2018-02-09 04:53:19","completedTime":"2018-02-09 04:53:24","cancelledTime":"2018-02-09 04:54:15","localCancelledTime":"0000-00-00 00:00:00","cancelReason":"기타-상세미입력","localOrderedTime":"2018-02-09 13:52:57","localOrderedDay":"5","localOrderedHour":"13","localOrderedDate":"2018-02-09","receiptIssue":"1","receiptId":"01048400922","receiptType":"IncomeDeduction","imp_uid":null,"approval":null,"card_info":null,"deliveryFee":null,"pickupTime":"2018-02-09 04:53:30","starRate":null,"review":"잘먹었습니다.","statusString":"취소","hidden":false,"orderListObj":{"takitId":"세종대@더큰도시락","menus":[{"menuNO":"세종대@더큰도시락;1","menuName":"돈까스도시락","quantity":1,"options":[],"price":3400,"unitPrice":3400,"takeout":"1","amount":3298}]},"userPhoneHref":"tel:01048400922","cancelReasonString":"기타-상세미입력"}); 

   this.orders.push({"orderId":"1548","takitId":"세종대@더큰도시락","shopName":"더큰도시락","orderName":"돈까스도시락(1)","payMethod":"cash","amount":"3298","takeout":"0","arrivalTime":null,"orderNO":"9","userId":"239","userName":"정권준","userPhone":"01048400922","orderStatus":"cancelled","orderList":"{\"takitId\":\"세종대@더큰도시락\",\"menus\":[{\"menuNO\":\"세종대@더큰도시락;1\",\"menuName\":\"돈까스도시락\",\"quantity\":1,\"options\":[],\"price\":3400,\"unitPrice\":3400,\"takeout\":\"1\",\"amount\":3298}]}","deliveryAddress":null,"userMSG":null,"orderedTime":"2018-02-09 04:52:57","checkedTime":"2018-02-09 04:53:19","completedTime":"2018-02-09 04:53:24","cancelledTime":"2018-02-09 04:54:15","localCancelledTime":"0000-00-00 00:00:00","cancelReason":"기타-상세미입력","localOrderedTime":"2018-02-09 13:52:57","localOrderedDay":"5","localOrderedHour":"13","localOrderedDate":"2018-02-09","receiptIssue":"1","receiptId":"01048400922","receiptType":"IncomeDeduction","imp_uid":null,"approval":null,"card_info":null,"deliveryFee":null,"pickupTime":"2018-02-09 04:53:30","starRate":null,"review":null,"statusString":"취소","hidden":false,"orderListObj":{"takitId":"세종대@더큰도시락","menus":[{"menuNO":"세종대@더큰도시락;1","menuName":"돈까스도시락","quantity":1,"options":[],"price":3400,"unitPrice":3400,"takeout":"1","amount":3298}]},"userPhoneHref":"tel:01048400922","cancelReasonString":"기타-상세미입력"}); 

   this.orders.forEach(order=>{
                  this.orders.push(this.convertOrderInfo(order));
                  console.log("orders:"+JSON.stringify(this.orders));
              });
  }

  changeValue(option){
    console.log("changeValue:"+option);
  }

    convertOrderInfo(orderInfo){
          var order:any={};
          order=orderInfo;
          console.log("!!!order:"+JSON.stringify(order));
          //var date=new Date(orderInfo.orderedTime);
          //console.log("local ordered time:"+ date.toLocaleString());//date.toLocaleDateString('ko-KR')
          order.statusString=this.getStatusString(order.orderStatus);
          if(order.orderStatus=="pickup" || order.orderStatus=="cancelled")
            order.hidden=true;
          else  
            order.hidden=false;

          if(order.hasOwnProperty("review")){
                order.hidden=false;
          }  
          order.orderListObj=JSON.parse(order.orderList);

          console.log("menus:"+ order.orderListObj.menus);
          if( typeof order.orderListObj.menus ==="string")
                order.orderListObj.menus=JSON.parse(order.orderListObj.menus);

          order.userPhoneHref="tel:"+order.userPhone; 
          //console.log("order.orderListObj:"+JSON.stringify(order.orderListObj));
          console.log("cancelReason:"+order.cancelReason);
          if(order.cancelReason!=undefined &&
                order.cancelReason!=null &&
                order.cancelReason!="")
            order.cancelReasonString=order.cancelReason;
          else
            order.cancelReasonString=undefined;
        ///////////////////////////////////////////////////////////////////////////////////////////////////
          if(order.orderStatus=="cancelled"){
              if(order.hasOwnProperty("cancelledTime")){
                  console.log("call getLocalTimeString")
                  order.localCancelledTimeString=this.timeUtil.getlocalTimeStringWithoutDay(order.cancelledTime);
              }
          }else{
                  order.localCancelledTimeString=undefined;
          }
          console.log("orderedHour/Min"+this.timeUtil.getlocalTimeStringWithoutDate(order.orderedTime));

          if(order.hasOwnProperty('completedTime') && order.completedTime!=null){
              console.log("completedTime:"+order.completedTime);
              order.localCompleteTimeString=this.timeUtil.getlocalTimeStringWithoutDay(order.completedTime);
          }
          if(order.hasOwnProperty('checkedTime') && order.completedTime!=null){
              console.log("checkedTime:"+order.checkedTime);
              order.localCheckedTimeString=this.timeUtil.getlocalTimeStringWithoutDay(order.checkedTime);        
          }
          if(order.hasOwnProperty('pickupTime') && order.pickupTime!=null){
              console.log("pickupTime:"+order.pickupTime);
              order.localPickupTimeString=this.timeUtil.getlocalTimeStringWithoutDay(order.pickupTime);        
          }
          if(order.hasOwnProperty('orderedTime') && order.orderedTime!=null){
              order.localOrderedTimeString=this.timeUtil.getlocalTimeStringWithoutDay(order.orderedTime);
          }
          if(order.hasOwnProperty('reviewTime') && order.reviewTime!=null){
              order.localReviewTimeString=this.timeUtil.getlocalTimeStringWithoutDay(order.reviewTime);        
          }
      ///////////////////////////////////////////////////////////////////////////////////////////////////
          return order;
    }

    toggleOrder(order){
        console.log("toggleOrder");
        order.hidden=(!order.hidden);
    }


    getStatusString(orderStatus){  // next status for label
      console.log("orderStatus:"+orderStatus);
      if(orderStatus=="paid"){
            return "접수";
      }else if(orderStatus=="cancelled"){
            return "취소";
      }else if(orderStatus=="checked"){
            return "완료";
      }else if(orderStatus=="completed"){
            return "전달";
      }else if(orderStatus=="pickup"){
            return "종료"
      }else{
        console.log("invalid orderStatus:"+orderStatus);
        return "미정";
      }
    }

 getTodayString(){
    var d = new Date();
    var mm = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1); // getMonth() is zero-based
    var dd  = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
    var dString=d.getFullYear()+'-'+(mm)+'-'+dd;
    return dString;
  }

     getOrderColor(order){
       if(order.orderStatus==='completed'){
          return 'gray';
       }else{
         return 'primary';
       }
     }

  getGMTtimeInMilliseconds(time:string){
      let year=parseInt(time.substr(0,4));
      let month=parseInt(time.substr(5,2))-1;
      let day=parseInt(time.substr(8,2));
      let hours=parseInt(time.substr(11,2));
      let minutes=parseInt(time.substr(15,2));
      let seconds=parseInt(time.substr(17,2));
      
      var d=Date.UTC(year, month, day, hours, minutes, seconds);
      return d;
  }

  AfterOnedayComplete(order){
    if(order.completedTime!=undefined){
      console.log("completedTime:"+order.completedTime);
      let completedTime:string=order.completedTime;
      let d=this.getGMTtimeInMilliseconds(completedTime);

      let now=new Date();
      //console.log("now: "+now.getTime());
      //console.log("completedTimeLimit: "+(d+ 24*60*60*1000));
      if(now.getTime()>(d+ 24*60*60*1000)){
            console.log("orderNo:"+order.orderNO +" hide is true ");
            return true;
      }
    }     
    return false;
  }
  AfterOnedayCompleteCancel(order){
    if(order.orderStatus=="paid" ||  order.orderStatus=="checked"){
        return false;
    }else if(order.cancelledTime!=undefined && order.cancelledTime!=null){
        //console.log("[AfterOnedayCompleteCancel]cancelledTime:"+order.cancelledTime);
        let cancelledTime:string=order.cancelledTime;
        let d=this.getGMTtimeInMilliseconds(cancelledTime);
        let now=new Date();
        if(now.getTime()<(d+24*60*60*1000)){
            return false;
        }
    }else if(order.completedTime!=undefined && order.completedTime!=null){
        let completedTime:string=order.completedTime;
        let d=this.getGMTtimeInMilliseconds(completedTime);
        let now=new Date();
        if(now.getTime()<(d+24*60*60*1000)){
            return false;
        }
    } 
    return true;  
  }

  doInfinite(infiniteScroll){
    infiniteScroll.enable(false);
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ShoptablePage');
  }

}
