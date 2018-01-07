import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {CashRefundAccountPage} from '../cash-refund-account/cash-refund-account';

/**
 * Generated class for the CashRefundMainPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cash-refund-main',
  templateUrl: 'cash-refund-main.html',
})
export class CashRefundMainPage {

  refundAccount;
  refundBank;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CashRefundMainPage');
  }

  callbackFunction = (_params) =>{
    return new Promise((resolve,reject)=>{
       console.log("callbackFunction:"+JSON.stringify(_params));
       this.refundAccount = _params.refundAccount;
       this.refundBank = _params.refundBank;
       resolve();
    })
  }
  registerAccount(){
      this.navCtrl.push( CashRefundAccountPage,{callback:this.callbackFunction});
  }

  modifyAccount(){
      this.navCtrl.push( CashRefundAccountPage,{callback:this.callbackFunction});
  }

  back(){
    this.navCtrl.pop();
  }
}
