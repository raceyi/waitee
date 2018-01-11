import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the OrderCancelPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-order-cancel',
  templateUrl: 'order-cancel.html',
})
export class OrderCancelPage {
  order;
  count=0;
  reasonNumber;

  fontColor=["#f2f2f2","#f2f2f2","#f2f2f2","#f2f2f2","#f2f2f2"];
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    //this.order=JSON.parse(this.navParams.get("order"));
    this.order={"orderId":"1490","takitId":"TEST2@TAKIT","shopName":"가로수그늘아래","orderName":"바닐라라떼(1)","payMethod":"cash","amount":"0","takeout":"0","arrivalTime":null,"orderNO":"1","userId":"60","userName":"이경주","userPhone":"01027228226","orderStatus":"paid","orderList":"{\"menus\":[{\"menuNO\":\"TEST2@TAKIT;1\",\"menuName\":\"바닐라라떼\",\"quantity\":1,\"options\":[],\"price\":\"0\",\"amount\":0}],\"total\":0,\"prevAmount\":0,\"takitDiscount\":0,\"couponDiscount\":0}","deliveryAddress":"","userMSG":null,"orderedTime":"2018-01-02 07:53:13","checkedTime":null,"completedTime":null,"cancelledTime":null,"localCancelledTime":null,"cancelReason":null,"localOrderedTime":"2018-01-02 16:53:13","localOrderedDay":"2","localOrderedHour":"16","localOrderedDate":"2018-01-02","receiptIssue":"1","receiptId":"01027228226","receiptType":"IncomeDeduction"};

    console.log("order:"+JSON.stringify(this.order));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderCancelPage');
  }

}
