import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {SignupPaymentPage} from '../signup-payment/signup-payment';

/**
 * Generated class for the SignupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {
  email:string;
  password:string;
  passwordConfirm:string;
  agreement:boolean=false;
  buttonColor:any={'color':'#6441a5'};

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  checked(){
    console.log("checked comes");
    if(!this.agreement){
        this.agreement=true;
        this.buttonColor={'color':'white',
                          'background-color':'#6441a5'
                        };
    }else{
        this.navCtrl.push(SignupPaymentPage);
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
  }

  show(title){
    console.log(title+" comes");
  }
}
