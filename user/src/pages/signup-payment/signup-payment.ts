import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {CashPasswordPage} from '../cash-password/cash-password';
import {TabsPage} from '../tabs/tabs';

/**
 * Generated class for the SignupPaymentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signup-payment',
  templateUrl: 'signup-payment.html',
})
export class SignupPaymentPage {
  cashId:string="";

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPaymentPage');
  }

  passwordInput(){
    this.navCtrl.push(CashPasswordPage);
  }

  registerPaymentInfo(){
    this.navCtrl.push(TabsPage);
  }
}
