import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {OrderDetailPage} from '../order-detail/order-detail';

/**
 * Generated class for the PaymentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html',
})
export class PaymentPage {
  inStoreColor="#6441a5";
  takeoutColor="#bdbdbd";
  deliveryColor="#bdbdbd";

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PaymentPage');
  }

  selectInStore(){
      this.inStoreColor="#6441a5";
      this.takeoutColor="#bdbdbd";
      this.deliveryColor="#bdbdbd";
  }

  selectTakeOut(){
      this.inStoreColor="#bdbdbd";
      this.takeoutColor="#6441a5";
      this.deliveryColor="#bdbdbd";
  }

  selectDelivery(){
      this.inStoreColor="#bdbdbd";
      this.takeoutColor="#bdbdbd";
      this.deliveryColor="#6441a5";
  }

  pay(){
    this.navCtrl.setRoot(OrderDetailPage,{order:JSON.stringify({"orderId":"1490","takitId":"TEST2@TAKIT","shopName":"가로수그늘아래","orderName":"바닐라라떼(1)","payMethod":"cash","amount":"0","takeout":"0","arrivalTime":null,"orderNO":"1","userId":"60","userName":"이경주","userPhone":"01027228226","orderStatus":"paid","orderList":"{\"menus\":[{\"menuNO\":\"TEST2@TAKIT;1\",\"menuName\":\"바닐라라떼\",\"quantity\":1,\"options\":[],\"price\":\"0\",\"amount\":0}],\"total\":0,\"prevAmount\":0,\"takitDiscount\":0,\"couponDiscount\":0}","deliveryAddress":"","userMSG":null,"orderedTime":"2018-01-02 07:53:13","checkedTime":null,"completedTime":null,"cancelledTime":null,"localCancelledTime":null,"cancelReason":null,"localOrderedTime":"2018-01-02 16:53:13","localOrderedDay":"2","localOrderedHour":"16","localOrderedDate":"2018-01-02","receiptIssue":"1","receiptId":"01027228226","receiptType":"IncomeDeduction"})});
  }
}
