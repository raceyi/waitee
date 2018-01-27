import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,App,ViewController} from 'ionic-angular';
import { ShopPage} from '../shop/shop';

/**
 * Generated class for the OrderDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-order-detail',
  templateUrl: 'order-detail.html',
})
export class OrderDetailPage {
  order;
  payClasses;
  refundClasses;
  constructor(public navCtrl: NavController, public navParams: NavParams,private app:App) {
      
    this.order=JSON.parse(this.navParams.get("order"));
    this.order={"orderId":"923","takitId":"세종대@더큰도시락","shopName":"더큰도시락","orderName":"데리치킨도시락(1)","payMethod":"cash","amount":"5510","takeout":"0","arrivalTime":null,"orderNO":"2","userId":"119","userName":"이경주","userPhone":"01027228226","orderStatus":"completed","orderList":"{\"takitId\":\"세종대@더큰도시락\",\"menus\":[{\"menuNO\":\"세종대@더큰도시락;1\",\"menuName\":\"데리치킨도시락\",\"quantity\":1,\"options\":[{\"name\":\"밥곱빼기\",\"price\":\"200\",\"number\":1},{\"name\":\"돈까스한장\",\"price\":\"1000\",\"number\":2},{\"name\":\"계란후라이\",\"price\":\"0\",\"number\":1,\"select\":\"완숙\"}],\"price\":5800,\"takeout\":\"2\",\"memo\":\"도시락배달\",\"amout\":5510}]}","deliveryAddress":null,"userMSG":null,"orderedTime":"2018-01-24 11:18:05","checkedTime":"2018-01-24 11:43:06","completedTime":"2018-01-24 11:44:27","cancelledTime":null,"localCancelledTime":null,"cancelReason":null,"localOrderedTime":"2018-01-24 20:18:05","localOrderedDay":"3","localOrderedHour":"20","localOrderedDate":"2018-01-24","receiptIssue":"0","receiptId":"","receiptType":"IncomeDeduction","deliveryFee":null,"imp_uid":null,"approval":null,"card_info":null,"orderStatusString":"준비완료","orderedTimeString":"18/01/24 20:18","name_sub":"세종대","name_main":"더큰도시락"};
    console.log("completedTime:"+this.order.completedTime);
    console.log("checkedTime:"+this.order.checkedTime);

//this.order=JSON.parse("{\"orderId\":\"910\",\"takitId\":\"서울창업허브@완니\",\"shopName\":\"완니\",\"orderName\":\"팟타이(1)\",\"payMethod\":\"card\",\"amount\":\"6860\",\"takeout\":\"0\",\"arrivalTime\":null,\"orderNO\":\"5\",\"userId\":\"119\",\"userName\":\"이경주\",\"userPhone\":\"01027228226\",\"orderStatus\":\"cancelled\",\"orderList\":\"{\\\"takitId\\\":\\\"서울창업허브@완니\\\",\\\"menus\\\":[{\\\"menuNO\\\":\\\"서울창업허브@완니;1\\\",\\\"menuName\\\":\\\"팟타이\\\",\\\"quantity\\\":1,\\\"options\\\":[],\\\"price\\\":7000,\\\"takeout\\\":\\\"1\\\",\\\"amout\\\":6860}]}\",\"deliveryAddress\":null,\"userMSG\":null,\"orderedTime\":\"2018-01-24 01:46:52\",\"checkedTime\":null,\"completedTime\":null,\"cancelledTime\":\"2018-01-24 01:47:04\",\"localCancelledTime\":\"0000-00-00 00:00:00\",\"cancelReason\":\"고객주문취소\",\"localOrderedTime\":\"2018-01-24 10:46:52\",\"localOrderedDay\":\"3\",\"localOrderedHour\":\"10\",\"localOrderedDate\":\"2018-01-24\",\"receiptIssue\":\"0\",\"receiptId\":\"\",\"receiptType\":\"IncomeDeduction\",\"deliveryFee\":null,\"imp_uid\":\"imps_247414432143\",\"approval\":\"47785205\",\"card_info\":\"{\\\"name\\\":\\\"BC카드\\\",\\\"mask_no\\\":\\\"53872082****9607\\\"}\",\"orderStatusString\":\"주문취소\",\"orderedTimeString\":\"18/01/24 10:46\",\"name_sub\":\"서울창업허브\",\"name_main\":\"완니\"}");
    this.order={"orderId":"934","takitId":"서울창업허브@완니","shopName":"완니","orderName":"팟타이(1)","payMethod":"card","amount":"6860","takeout":"0","arrivalTime":null,"orderNO":"6","userId":"119","userName":"이경주","userPhone":"01027228226","orderStatus":"completed","orderList":"{\"takitId\":\"서울창업허브@완니\",\"menus\":[{\"menuNO\":\"서울창업허브@완니;1\",\"menuName\":\"팟타이\",\"quantity\":1,\"options\":[],\"price\":7000,\"takeout\":\"1\",\"amout\":6860}]}","deliveryAddress":null,"userMSG":null,"orderedTime":"2018-01-25 08:53:14","checkedTime":"2018-01-25 08:53:32","completedTime":"2018-01-25 10:05:48","cancelledTime":null,"localCancelledTime":null,"cancelReason":null,"localOrderedTime":"2018-01-25 17:53:14","localOrderedDay":"4","localOrderedHour":"17","localOrderedDate":"2018-01-25","receiptIssue":"0","receiptId":"","receiptType":"IncomeDeduction","deliveryFee":null,"imp_uid":"imps_510396483496","approval":"55519159","card_info":"{\"name\":\"BC카드\",\"mask_no\":\"53872082****9607\"}","pickupTime":null};
    console.log("orderId:..."+this.order.orderId);

    console.log("this.order.card_info:"+this.order.card_info);
 
   // this.order={"orderId":"910","takitId":"서울창업허브@완니","shopName":"완니","orderName":"팟타이(1)","payMethod":"card","amount":"6860","takeout":"0","arrivalTime":null,"orderNO":"5","userId":"119","userName":"이경주","userPhone":"01027228226","orderStatus":"cancelled","orderList":"{\"takitId\":\"서울창업허브@완니\",\"menus\":[{\"menuNO\":\"서울창업허브@완니;1\",\"menuName\":\"팟타이\",\"quantity\":1,\"options\":[],\"price\":7000,\"takeout\":\"1\",\"amout\":6860}]}","deliveryAddress":null,"userMSG":null,"orderedTime":"2018-01-24 01:46:52","checkedTime":null,"completedTime":null,"cancelledTime":"2018-01-24 01:47:04","localCancelledTime":"0000-00-00 00:00:00","cancelReason":"고객주문취소","localOrderedTime":"2018-01-24 10:46:52","localOrderedDay":"3","localOrderedHour":"10","localOrderedDate":"2018-01-24","receiptIssue":"0","receiptId":"","receiptType":"IncomeDeduction","deliveryFee":null,"imp_uid":"imps_247414432143","approval":"47785205","card_info":"{\"name\":\"BC카드\",\"mask_no\":\"53872082****9607\"}"};

    console.log("order:"+JSON.stringify(this.order));    
    console.log(this.order.cancelledTime)
    this.order.orderedTime="2018-01-24 00:51:45";
    let d=new Date(this.getGMTtimeInMilliseconds(this.order.orderedTime));
    console.log("date:"+d.getDay());
    let orderTimeString=d.getFullYear()+"/"+d.getMonth()+"/"+d.getDate()+" "+d.getDay()+" "+d.getHours()+" "+d.getMinutes();
    console.log("orderTimeString:"+orderTimeString);
    this.getlocalTimeString(this.order.ordredTime);
    this.order.orderListObj=JSON.parse(this.order.orderList);

    /* What is local time? hum... It should be shop time
    if(this.order.localOrderedTime)
        this.order.localOrderedTimeString  =
    if(this.order.localCompleteTime)  
        this.order.localCompleteTimeString =
    if(this.order.localCheckedTime)  
        this.order.localCheckedTimeString  =
    if(this.order.localCanceledTime)    
        this.order.localCanceledTimeString =
    if(this.order.localPickupTime)    
        this.order.localPickupTime=
    */

    this.order.localOrderedTimeString = "2017/10/09 월요일  12:19"
    this.order.localCompleteTimeString ="2017/10/09 월요일  12:19"
    this.order.localCheckedTimeString = "2017/10/09 월요일  12:19"
   // this.order.localCanceledTimeString ="2017/10/09 월요일  12:19"
    this.order.localCanceledTimeString =this.getlocalTimeString(this.order.cancelledTime);

    this.order.localPickupTimeString ="2017/10/09 월요일  12:19"

    if(this.order.orderStatus=="cancelled"){
        this.payClasses={
            paymentLast:false,
            payment:true
        };
        this.refundClasses={
            paymentLast:true,
            payment:false
        };
    }else{
        this.payClasses={
            paymentLast:true,
            payment:false
        };
    }

  }

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

  dayInPrintOut(time,day){
        let string=time.substr(0,4)+"/"+
            time.substr(5,2)+"/"+
            time.substr(8,2)+" "+
            this.dayInKorean(day)+" "+
            time.substr(11,5);   
        return string;
  }

  dayInKorean(day){  //please use moment or other library for langauge later
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
    let d=new Date(this.getGMTtimeInMilliseconds(this.order.orderedTime));
    //console.log("date:"+d.getDay());
    let month=d.getMonth()+1;
    let monthStr=(month <= 9 ? '0': '') + (month);
    let day=d.getDate();
    let dayStr=(day <= 9 ? '0': '') + (day);
    let hour=d.getHours();
    let hourStr=(hour <= 9 ? '0': '') + (hour);
    let min=d.getMinutes();
    let minStr=(min <= 9 ? '0': '') + (min);
    let localTimeString=d.getFullYear()+"/"+monthStr+"/"+dayStr+" "+this.dayInKorean(d.getDay())+" "+hourStr+":"+minStr;
    console.log("localTimeString:"+localTimeString);
    return localTimeString;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderDetailPage');
    let  views:ViewController[]; 
    views=this.navCtrl.getViews();
    views.forEach(view=>{
        console.log("view.name:"+view.name);
        if(view.name==="CashPasswordPage"||
            view.name==="MenuPage"||
            view.name==="PaymentPage"){ //remove cash-password,menus,payment
                console.log("remove "+view.name);
            this.navCtrl.removeView(view);
        }
    })
  }

  back(){
    if( this.navCtrl.canGoBack() ){
        this.navCtrl.pop();
    }else{
        this.navCtrl.setRoot(ShopPage);
    }
  }
}
