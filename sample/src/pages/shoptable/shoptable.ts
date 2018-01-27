import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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
  orders=[];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.getOrders( );

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ShoptablePage');
  }

    convertOrderInfo(orderInfo){
          var order:any={};
          order=orderInfo;
          console.log("!!!order:"+JSON.stringify(order));
          //var date=new Date(orderInfo.orderedTime);

          //console.log("local ordered time:"+ date.toLocaleString());//date.toLocaleDateString('ko-KR')
          order.statusString=this.getStatusString(order.orderStatus);
          if(order.orderStatus=="completed" || order.orderStatus=="cancelled")
            order.hidden=true;
          else  
            order.hidden=false;
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
          order.review="맛있어요";
          return order;
    }

     getOrders( ){
       let res;
        res={"result":"success","version":"0.04","orders":[{"orderId":"923","takitId":"세종대@더큰도시락","shopName":"더큰도시락","orderName":"데리치킨도시락(1)","payMethod":"cash","amount":"5510","takeout":"0","arrivalTime":null,"orderNO":"2","userId":"119","userName":"이경주","userPhone":"01027228226","orderStatus":"completed","orderList":"{\"takitId\":\"세종대@더큰도시락\",\"menus\":[{\"menuNO\":\"세종대@더큰도시락;1\",\"menuName\":\"데리치킨도시락\",\"quantity\":1,\"options\":[{\"name\":\"밥곱빼기\",\"price\":\"200\",\"number\":1},{\"name\":\"돈까스한장\",\"price\":\"1000\",\"number\":2},{\"name\":\"계란후라이\",\"price\":\"0\",\"number\":1,\"select\":\"완숙\"}],\"price\":5800,\"takeout\":\"2\",\"memo\":\"도시락배달\",\"amout\":5510}]}","deliveryAddress":null,"userMSG":null,"orderedTime":"2018-01-24 11:18:05","checkedTime":"2018-01-24 11:43:06","completedTime":"2018-01-24 11:44:27","cancelledTime":null,"localCancelledTime":null,"cancelReason":null,"localOrderedTime":"2018-01-24 20:18:05","localOrderedDay":"3","localOrderedHour":"20","localOrderedDate":"2018-01-24","receiptIssue":"0","receiptId":"","receiptType":"IncomeDeduction","deliveryFee":null,"imp_uid":null,"approval":null,"card_info":null},{"orderId":"915","takitId":"세종대@더큰도시락","shopName":"더큰도시락","orderName":"데리치킨도시락(1)","payMethod":"cash","amount":"3420","takeout":"0","arrivalTime":null,"orderNO":"1","userId":"119","userName":"이경주","userPhone":"01027228226","orderStatus":"cancelled","orderList":"{\"takitId\":\"세종대@더큰도시락\",\"menus\":[{\"menuNO\":\"세종대@더큰도시락;1\",\"menuName\":\"데리치킨도시락\",\"quantity\":1,\"options\":[{\"name\":\"계란후라이\",\"price\":\"0\",\"number\":1,\"select\":\"반숙\"}],\"price\":3600,\"takeout\":\"2\",\"amout\":3420}]}","deliveryAddress":null,"userMSG":null,"orderedTime":"2018-01-24 07:13:46","checkedTime":null,"completedTime":null,"cancelledTime":"2018-01-24 07:13:49","localCancelledTime":"0000-00-00 00:00:00","cancelReason":"고객주문취소","localOrderedTime":"2018-01-24 16:13:46","localOrderedDay":"3","localOrderedHour":"16","localOrderedDate":"2018-01-24","receiptIssue":"0","receiptId":"","receiptType":"IncomeDeduction","deliveryFee":null,"imp_uid":null,"approval":null,"card_info":null}]};

          console.log("res.length:"+res.orders.length);
          res.orders.forEach(order=>{
              this.orders.push(this.convertOrderInfo(order));
              console.log("orders:"+JSON.stringify(this.orders));
          });
          this.orders[0].review="맛있어요.";
     }

  toggleOrder(order){
    console.log("toggleOrder");
    if(order.orderStatus=="paid" ||  order.orderStatus=="checked")
      order.hidden=false;
    else
      order.hidden=(!order.hidden);
  }


    getStatusString(orderStatus){  // next status for label
      console.log("orderStatus:"+orderStatus);
      if(orderStatus=="paid"){
            return "접수";
      }else if(orderStatus=="cancelled"){
            return "취소";
      }else if(orderStatus=="checked"){
            return "준비";
      }else if(orderStatus=="completed"){
            return "전달";
      }else if(orderStatus=="pickup"){
            return "종료"
      }else{
        console.log("invalid orderStatus:"+orderStatus);
        return "미정";
      }
    }

     getOrderColor(order){
       if(order.orderStatus==='completed'){
          return 'gray';
       }else{
         return 'primary';
       }
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


}
