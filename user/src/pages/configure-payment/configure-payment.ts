import { Component,NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController,App} from 'ionic-angular';
import {CashPasswordPage} from '../cash-password/cash-password';
import {ServerProvider} from '../../providers/server/server';
import {StorageProvider} from '../../providers/storage/storage';
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
  mobileAuthentication:boolean=false;

  constructor(public navCtrl: NavController,
              private ngZone:NgZone,
              private app:App,
              private storageProvider:StorageProvider,
              private serverProvider:ServerProvider,
              private alertCtrl:AlertController,
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

  phoneAuth(){
       this.serverProvider.mobileAuth().then((res:any)=>{
                if(res.userPhone!=this.storageProvider.phone){
                        let alert = this.alertCtrl.create({
                            title: "휴대폰 번호가 일치하지 않습니다.",
                            buttons: ['OK']
                        });
                        alert.present();
                        return;
                }
                this.mobileAuthentication=true;
        },err=>{

        });
  }
  
  modify(){
      if(this.storageProvider.tourMode){
            let alert = this.alertCtrl.create({
                title: '둘러보기모드입니다.',
                buttons: ['OK']
            });
            alert.present();
            return;
      }      
      if(!this.mobileAuthentication){
            let alert = this.alertCtrl.create({
                title: '휴대폰 본인인증을 수행해 주시기 바랍니다.',
                buttons: ['OK']
            });
            alert.present();
            return;
      }
                let body = {cashId:this.storageProvider.cashId,password:this.cashIdPassword};
                console.log("modifyCashPwd");
                this.serverProvider.post(this.storageProvider.serverAddress+"/modifyCashPwd",body).then((res:any)=>{
                    if(res.result=="success"){
                        let alert = this.alertCtrl.create({
                            title: "비밀번호 수정에 성공했습니다.",
                            buttons:[
                            {
                                text: 'OK',
                                handler: () => {
                                    this.navCtrl.pop();
                                }
                            }]
                        });
                        alert.present();
                    }else{
                        let alert = this.alertCtrl.create({
                            title: "캐쉬 비밀번호 설정에 실패했습니다.",
                            buttons: ['OK']
                        });
                        alert.present();
                    }
                },(err)=>{
                    if(err=="NetworkFailure"){
                        let alert = this.alertCtrl.create({
                            title: "서버와 통신에 문제가 있습니다.",
                            buttons: ['OK']
                        });
                        alert.present();
                    }else{
                        console.log("createCashId error "+err);
                        let alert = this.alertCtrl.create({
                            title: "캐쉬 비밀번호 설정에 실패했습니다.",
                            buttons: ['OK']
                        });
                        alert.present();
                    }
                });   
  }

  back(){
    this.navCtrl.pop();
  }
}
