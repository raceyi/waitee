import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';

/**
 * Generated class for the PasswordResetPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-password-reset',
  templateUrl: 'password-reset.html',
})
export class PasswordResetPage {
  email;
  phone;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private alertCtrl: AlertController,
              private serverProvider:ServerProvider,
              private storageProvider:StorageProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PasswordResetPage');
  }

  back(){
    console.log("[PasswordResetPage]back");
    this.navCtrl.pop();
  }

    resetPassword(){        
      console.log("resetPassword");
      console.log('emailLogin comes email:'+this.email+" phone:"+this.phone);    
      //Please check the validity of email and phone.
      if(this.email.trim().length==0){
              let alert = this.alertCtrl.create({
                        title: '이메일을 입력해주시기 바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
                return;
      }
      if(this.phone.trim().length==0){
                let alert = this.alertCtrl.create({
                        title: '등록폰번호를 입력해주시기 바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
                return;
      }  
      this.callServerResetPassword(this.email,this.phone).then(()=>{
          // 'success'(move into login page)
           let alert = this.alertCtrl.create({
                        title: '이메일로 새로운 비밀번호가 전달되었습니다.',
                        buttons: ['OK']
                    });
                    alert.present().then(()=>{
                         this.navCtrl.pop();
                    });
      },(err)=>{
            let alert = this.alertCtrl.create({
                        title: '일치하는 가입자 정보가 존재하지 않습니다.',
                        buttons: ['OK']
                    });
                    alert.present().then(()=>{

                    });
      });
    }

    callServerResetPassword(email,phone){
      return new Promise((resolve, reject)=>{
              console.log("callServerResetPassword");
              let body = JSON.stringify({email:email,phone:phone});
              let headers = new Headers();
              headers.append('Content-Type', 'application/json');
              console.log("server:"+ this.storageProvider.serverAddress);

              this.serverProvider.postAnonymous(this.storageProvider.serverAddress+"/passwordReset", body).then((res:any)=>{
                var result:string=res.result;
                console.log("res:"+JSON.stringify(res));
                if(result==="success")
                    resolve(res); 
                else{
                    reject("failure");
                }    
             },(err)=>{
                 console.log("passwordReset no response");
                 reject("passwordReset no response");
             });
         });
    }


}
