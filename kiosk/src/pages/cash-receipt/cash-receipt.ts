import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import { CartProvider } from '../../providers/cart/cart';
import {HomePage} from '../home/home';

/**
 * Generated class for the CashReceiptPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cash-receipt',
  templateUrl: 'cash-receipt.html',
})
export class CashReceiptPage {
  receiptType="IncomeDeduction";
  receiptId="";
  receiptIssue;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private alertCtrl:AlertController,
              public cartProvider:CartProvider) {
      this.receiptIssue=this.navParams.get("receipt");
      if(this.navParams.get("phone"))
          this.receiptId=this.navParams.get("phone");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CashReceiptPage');
  }

  orderDone(){
      this.cartProvider.resetCart();
      this.navCtrl.setRoot(HomePage,{class:"HomePage"});
  }

  issueReceipt(){
      if(this.receiptId.length< 10 || this.receiptId.length>=20){
                    let alert = this.alertCtrl.create({
                        title: "현금영수증 발급번호는 10자이상 19자이하의 숫자입니다.",
                        buttons: ['OK']
                    });
                    alert.present();
                    return;
      }
      this.cartProvider.resetCart();
      this.navCtrl.setRoot(HomePage,{class:"HomePage"});
  }
}
