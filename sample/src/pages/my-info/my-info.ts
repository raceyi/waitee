import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,App } from 'ionic-angular';
import { PolicyPage} from  '../policy/policy';
import {FaqPage} from '../faq/faq';
import {CompanyInfoPage} from '../company-info/company-info';
import {ConfigureReceiptPage} from '../configure-receipt/configure-receipt';
import {ConfigurePasswordPage} from '../configure-password/configure-password';
import {ConfigurePaymentPage} from '../configure-payment/configure-payment';

/**
 * Generated class for the MyInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my-info',
  templateUrl: 'my-info.html',
})
export class MyInfoPage {
  user={name:'김다현', email:'xxxxxx.kim@gmail.com'}
  
  constructor(public navCtrl: NavController, public navParams: NavParams,private app: App) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MyInfoPage');
  }

  goToPolicy(){
    this.app.getRootNavs()[0].push(PolicyPage);
  }

  goToFaq(){
    this.app.getRootNavs()[0].push(FaqPage);
  }

  goToCompanyInfo(){
    this.app.getRootNavs()[0].push(CompanyInfoPage);
  }

  modifyEmailLogin(){
     this.app.getRootNavs()[0].push(ConfigurePasswordPage);
  }

  modifyPaymentPassword(){
     this.app.getRootNavs()[0].push(ConfigurePaymentPage);
  }

  modifyReceiptInfo(){
     this.app.getRootNavs()[0].push(ConfigureReceiptPage);
  }

}
