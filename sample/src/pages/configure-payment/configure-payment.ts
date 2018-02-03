import { Component,NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {CashPasswordPage} from '../cash-password/cash-password';

/**
 * Generated class for the ConfigurePaymentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-configure-payment',
  templateUrl: 'configure-payment.html',
})
export class ConfigurePaymentPage {

  cashIdPassword:string;
  cashIdPasswordConfirm:string;

  passwordConfirmString:string="";
  passwordString:string="";
  passwordMask:boolean=false;
  passwordConfirmMask:boolean=false;

  constructor(public navCtrl: NavController,
              private ngZone:NgZone,
              public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConfigurePaymentPage');
  }

 myCallbackPasswordFunction = (_params) => {
      return new Promise((resolve, reject) => {
          console.log("password confirm params:"+_params);
          this.cashIdPassword=_params;
          this.ngZone.run(()=>{
                this.passwordString="******";
                this.passwordMask=true;
                console.log("this.passwordConfirmString:"+this.passwordString);
          });
          resolve();
      });
  }


  myCallbackPasswordConfirmFunction = (_params) => {
      return new Promise((resolve, reject) => {
          console.log("password confirm params:"+_params);
          this.cashIdPasswordConfirm=_params;
          this.ngZone.run(()=>{
                this.passwordConfirmString="******";
                this.passwordConfirmMask=true;
                console.log("this.passwordConfirmString:"+this.passwordConfirmString);
          });
          resolve();
      });
  }

  passwordInput(){
      console.log("passwordInput");
      this.navCtrl.push(CashPasswordPage,{callback: this.myCallbackPasswordFunction, order:false,
                                          title:"결제비밀번호",description:"사용하실 결제 비밀번호를 입력해주세요."});
  }

  passwordConfirmInput(){
      console.log("passwordConfirmInput");
      this.navCtrl.push(CashPasswordPage,{callback: this.myCallbackPasswordConfirmFunction, order:false,
                                          title:"결제비밀번호확인" ,description:"결제 비밀번호를 한번 더 입력해주세요."});
  }

  modify(){

  }

  back(){
    this.navCtrl.pop();
  }
}
