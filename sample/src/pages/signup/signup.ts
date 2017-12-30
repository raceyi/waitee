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
  color1="#4a4a4a"; 
  color2="#4a4a4a";
  color3="#4a4a4a"; 
  color4="#4a4a4a";
  color5="#4a4a4a"; 

  userAgreementShown=false;        //1
  userInfoShown=false;             //2
  transactionAgreementShown=false; //3
  locationShown=false;             //4
  pictureShown=false;              //5

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
    
    if(title=="1"){
        this.color1="#6441a5";
        this.color2="#4a4a4a";
        this.color3="#4a4a4a";
        this.color4="#4a4a4a";
        this.color5="#4a4a4a";
        this.userAgreementShown=true;         //1
        this.userInfoShown=false;             //2
        this.transactionAgreementShown=false; //3
        this.locationShown=false;             //4
        this.pictureShown=false;              //5
    }else if(title=="2"){
        this.color2="#6441a5";
        this.color1="#4a4a4a";
        this.color3="#4a4a4a";
        this.color4="#4a4a4a";
        this.color5="#4a4a4a";
        this.userAgreementShown=false;         //1
        this.userInfoShown=true;             //2
        this.transactionAgreementShown=false; //3
        this.locationShown=false;             //4
        this.pictureShown=false;              //5
    }else if(title=="3"){
        this.color3="#6441a5";
        this.color1="#4a4a4a";
        this.color2="#4a4a4a";
        this.color4="#4a4a4a";
        this.color5="#4a4a4a";
        this.userAgreementShown=false;         //1
        this.userInfoShown=false;             //2
        this.transactionAgreementShown=true; //3
        this.locationShown=false;             //4
        this.pictureShown=false;              //5        
    }else if(title=="4"){
        this.color4="#6441a5";
        this.color1="#4a4a4a";
        this.color2="#4a4a4a";
        this.color3="#4a4a4a";
        this.color5="#4a4a4a";
        this.userAgreementShown=false;         //1
        this.userInfoShown=false;             //2
        this.transactionAgreementShown=false; //3
        this.locationShown=true;             //4
        this.pictureShown=false;              //5        
    }else if(title=="5"){
        this.color5="#6441a5";
        this.color1="#4a4a4a";
        this.color2="#4a4a4a";
        this.color3="#4a4a4a";
        this.color4="#4a4a4a";
        this.userAgreementShown=false;         //1
        this.userInfoShown=false;             //2
        this.transactionAgreementShown=false; //3
        this.locationShown=false;             //4
        this.pictureShown=true;              //5                
    }
    
  }
}
