import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,App } from 'ionic-angular';
import {ReviewInputPage} from '../review-input/review-input';
import {OrderDetailPage} from '../order-detail/order-detail';

/**
 * Generated class for the OrderListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-order-list',
  templateUrl: 'order-list.html',
})
export class OrderListPage {
  index=0; // 0: 1개월, 1:2개월, 2:3개월, 3:6개월 
  searchText;
  searchDone=false;
  colStyle=[];
  buttonStyle=[];
  historyOrders=[];

  constructor(public navCtrl: NavController, public navParams: NavParams,private app:App) {
    this.colStyle=[
          {"border-right-style": "solid",
           "border-width": "1px",
           "border-radius":"13.5px"
          },
          {
            'boder-style':'none'
          },
          {
            'boder-style':'none'
          },
          {
            'boder-style':'none'
          }
    ];

    this.buttonStyle=[
          {'color':'#6441a5' },
          {'color':'#bdbdbd' },
          {'color':'#bdbdbd' },
          {'color':'#bdbdbd' }
    ];

   this.historyOrders=[{"orderId":"1490","takitId":"TEST2@TAKIT","shopName":"가로수그늘아래","orderName":"바닐라라떼(1)","payMethod":"cash","amount":"0","takeout":"0","arrivalTime":null,"orderNO":"1","userId":"60","userName":"이경주","userPhone":"01027228226","orderStatus":"paid","orderList":"{\"menus\":[{\"menuNO\":\"TEST2@TAKIT;1\",\"menuName\":\"바닐라라떼\",\"quantity\":1,\"options\":[],\"price\":\"0\",\"amount\":0}],\"total\":0,\"prevAmount\":0,\"takitDiscount\":0,\"couponDiscount\":0}","deliveryAddress":"","userMSG":null,"orderedTime":"2018-01-02 07:53:13","checkedTime":null,"completedTime":null,"cancelledTime":null,"localCancelledTime":null,"cancelReason":null,"localOrderedTime":"2018-01-02 16:53:13","localOrderedDay":"2","localOrderedHour":"16","localOrderedDate":"2018-01-02","receiptIssue":"1","receiptId":"01027228226","receiptType":"IncomeDeduction"},
                       {"orderId":"1485","takitId":"TEST2@TAKIT","shopName":"가로수그늘아래","orderName":"아메리카노(1)","payMethod":"cash","amount":"0","takeout":"0","arrivalTime":null,"orderNO":"1","userId":"60","userName":"이경주","userPhone":"01027228226","orderStatus":"completed","orderList":"{\"menus\":[{\"menuNO\":\"TEST2@TAKIT;1\",\"menuName\":\"아메리카노\",\"quantity\":1,\"options\":[],\"price\":\"0\",\"amount\":0}],\"total\":0,\"prevAmount\":0,\"takitDiscount\":0,\"couponDiscount\":0}","deliveryAddress":"","userMSG":null,"orderedTime":"2017-12-26 00:20:42","checkedTime":"2017-12-26 00:21:17","completedTime":"2017-12-26 00:21:33","cancelledTime":null,"localCancelledTime":null,"cancelReason":null,"localOrderedTime":"2017-12-26 09:20:42","localOrderedDay":"2","localOrderedHour":"9","localOrderedDate":"2017-12-26","receiptIssue":"1","receiptId":"01027228226","receiptType":"IncomeDeduction"},
                       {"orderId":"1485","takitId":"TEST2@TAKIT","shopName":"가로수그늘아래","orderName":"아메리카노(1)","payMethod":"cash","amount":"0","takeout":"0","arrivalTime":null,"orderNO":"1","userId":"60","userName":"이경주","userPhone":"01027228226","orderStatus":"pickup","orderList":"{\"menus\":[{\"menuNO\":\"TEST2@TAKIT;1\",\"menuName\":\"아메리카노\",\"quantity\":1,\"options\":[],\"price\":\"0\",\"amount\":0}],\"total\":0,\"prevAmount\":0,\"takitDiscount\":0,\"couponDiscount\":0}","deliveryAddress":"","userMSG":null,"orderedTime":"2017-12-26 00:20:42","checkedTime":"2017-12-26 00:21:17","completedTime":"2017-12-26 00:21:33","cancelledTime":null,"localCancelledTime":null,"cancelReason":null,"localOrderedTime":"2017-12-26 09:20:42", "localPickupTime":"2017-12-26 09:20:42","localOrderedDay":"2","localOrderedHour":"9","localOrderedDate":"2017-12-26","receiptIssue":"1","receiptId":"01027228226","receiptType":"IncomeDeduction"},
                       {"orderId":"1485","takitId":"TEST2@TAKIT","shopName":"가로수그늘아래","orderName":"아메리카노(1)","payMethod":"cash","amount":"0","takeout":"0","arrivalTime":null,"orderNO":"1","userId":"60","userName":"이경주","userPhone":"01027228226","orderStatus":"cancelled","orderList":"{\"menus\":[{\"menuNO\":\"TEST2@TAKIT;1\",\"menuName\":\"아메리카노\",\"quantity\":1,\"options\":[],\"price\":\"0\",\"amount\":0}],\"total\":0,\"prevAmount\":0,\"takitDiscount\":0,\"couponDiscount\":0}","deliveryAddress":"","userMSG":null,"orderedTime":"2017-12-26 00:20:42","checkedTime":"2017-12-26 00:21:17","completedTime":"2017-12-26 00:21:33","cancelledTime":null,"localCancelledTime":null,"cancelReason":null,"localOrderedTime":"2017-12-26 09:20:42","localOrderedDay":"2","localOrderedHour":"9","localOrderedDate":"2017-12-26","receiptIssue":"1","receiptId":"01027228226","receiptType":"IncomeDeduction"},                       
                       {"orderId":"1484","takitId":"TEST2@TAKIT","shopName":"가로수그늘아래","orderName":"바닐라라떼(1)","payMethod":"cash","amount":"0","takeout":"0","arrivalTime":null,"orderNO":"1","userId":"60","userName":"이경주","userPhone":"01027228226","orderStatus":"checked","orderList":"{\"menus\":[{\"menuNO\":\"TEST2@TAKIT;1\",\"menuName\":\"바닐라라떼\",\"quantity\":1,\"options\":[],\"price\":\"0\",\"amount\":0}],\"total\":0,\"prevAmount\":0,\"takitDiscount\":0,\"couponDiscount\":0}","deliveryAddress":"","userMSG":null,"orderedTime":"2017-12-20 05:00:32","checkedTime":null,"completedTime":null,"cancelledTime":"2017-12-20 05:04:36","localCancelledTime":"0000-00-00 00:00:00","cancelReason":"고객접수취소","localOrderedTime":"2017-12-20 14:00:32","localOrderedDay":"3","localOrderedHour":"14","localOrderedDate":"2017-12-20","receiptIssue":"1","receiptId":"01027228226","receiptType":"IncomeDeduction"}];
  
   this.historyOrders.forEach(order => {
     order.orderedTimeString=order.localOrderedTime[2]+order.localOrderedTime[3]+"/"+
                              order.localOrderedTime[5]+order.localOrderedTime[6]+"/"+
                              order.localOrderedTime[8]+order.localOrderedTime[9]+" "+
                              order.localOrderedTime[11]+order.localOrderedTime[12]+":"+
                              order.localOrderedTime[14]+order.localOrderedTime[15];
     order.orderStatusString=this.getOrderStatusString(order);
   });
}

  getOrderStatusString(order){
    console.log("status:"+order.orderStatus);
    if(order.orderStatus=="paid")
      return "결제완료";
    if(order.orderStatus=="cancelled")
      return "주문취소";
    if(order.orderStatus=="checked")
      return "주문접수";
    if(order.orderStatus=="completed")
      return "준비완료";      
    if(order.orderStatus=="pickup"){
       //console.log(this.getDisplayTime(order.localPickupTime));
      return "픽업완료("+ this.getDisplayTime(order.localPickupTime)+')';
    }  
  }

  getDisplayTime(measureTime){
    return measureTime[2]+measureTime[3]+"/"+
          measureTime[5]+measureTime[6]+"/"+
          measureTime[8]+measureTime[9]+" "+
          measureTime[11]+measureTime[12]+":"+
          measureTime[14]+measureTime[15];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderListPage');
  }
  
  onInput(event){

  }

  resetStyle(){
    this.buttonStyle=[
          {'color':'#bdbdbd' },
          {'color':'#bdbdbd' },
          {'color':'#bdbdbd' },
          {'color':'#bdbdbd' }]

    this.colStyle=[
          {
            'boder-style':'none'
          },
          {
            'boder-style':'none'
          },
          {
            'boder-style':'none'
          },
          {
            'boder-style':'none'
          }
    ];
  }

  select(index){
    console.log("select "+index+ " this.index:"+this.index);
    this.resetStyle();
    this.buttonStyle[index]={'color':'#6441a5' };
    if(index==0)
        this.colStyle[index]={"border-right-style": "solid",
                            "border-width": "1px",
                            "border-radius":"13.5px"
                          };
    else if(index==3)
        this.colStyle[index]={"border-left-style": "solid",
                            "border-width": "1px",
                            "border-radius":"13.5px"
                          };
    else{
        this.colStyle[index]={"border-left-style": "solid",
                              "border-right-style": "solid",
                              "border-width": "1px",
                              "border-radius":"13.5px"
                          };      
    }
    this.index=index;                      
    console.log("index:"+index);                       
  }

  search(){
    console.log("search comes");
    this.searchDone=true;
  }

  clear(){
    console.log("clear comes");
    this.searchDone=false;
  }

  inputReview(order){
     this.app.getRootNavs()[0].push(ReviewInputPage,{order:JSON.stringify(order)});
  }

  orderDetail(order){  
      this.app.getRootNavs()[0].push(OrderDetailPage,{order:JSON.stringify(order)});
  }

  doInfinite(infiniteScroll){
      console.log("doInfinite");
     // this.historyOrders.push({"orderId":"1490","takitId":"TEST2@TAKIT","shopName":"가로수그늘아래","orderName":"바닐라라떼(1)","payMethod":"cash","amount":"0","takeout":"0","arrivalTime":null,"orderNO":"1","userId":"60","userName":"이경주","userPhone":"01027228226","orderStatus":"paid","orderList":"{\"menus\":[{\"menuNO\":\"TEST2@TAKIT;1\",\"menuName\":\"바닐라라떼\",\"quantity\":1,\"options\":[],\"price\":\"0\",\"amount\":0}],\"total\":0,\"prevAmount\":0,\"takitDiscount\":0,\"couponDiscount\":0}","deliveryAddress":"","userMSG":null,"orderedTime":"2018-01-02 07:53:13","checkedTime":null,"completedTime":null,"cancelledTime":null,"localCancelledTime":null,"cancelReason":null,"localOrderedTime":"2018-01-02 16:53:13","localOrderedDay":"2","localOrderedHour":"16","localOrderedDate":"2018-01-02","receiptIssue":"1","receiptId":"01027228226","receiptType":"IncomeDeduction"});
     // infiniteScroll.complete();
      infiniteScroll.enable(false);
  }
}
