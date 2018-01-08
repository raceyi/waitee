import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController,App} from 'ionic-angular';
import { LoginEmailPage } from '../login-email/login-email';
import { NativeStorage } from '@ionic-native/native-storage';
import {StorageProvider} from '../../providers/storage/storage';
import {LoginProvider} from '../../providers/login/login';

/**
 * Generated class for the LoginMainPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login-main',
  templateUrl: 'login-main.html',
})
export class LoginMainPage {

  constructor(public navCtrl: NavController, public navParams: NavParams
      ,private loginProvider:LoginProvider
      ,private alertCtrl: AlertController
      ,private storageProvider:StorageProvider
      ,private app:App) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginMainPage');
  }

  emaillogin(){
    this.app.getRootNavs()[0].push(LoginEmailPage);
  }


  facebook(){
        this.socialLogin('facebook');
  }

  kakao(){
        this.socialLogin('kakao');
  }
    socialLogin(type){
    this.loginProvider.loginSocialLogin(type).then((res:any)=>{
      console.log("socialLogin res:"+JSON.stringify(res));
      if(parseFloat(res.version)>parseFloat(this.storageProvider.version)){
        let alert = this.alertCtrl.create({
                        title: '앱버전을 업데이트해주시기 바랍니다.',
                        subTitle: '현재버전에서는 일부 기능이 정상동작하지 않을수 있습니다.',
                        buttons: ['OK']
                    });
            alert.present();
      }
      console.log("res.result:"+JSON.stringify(res.result));
/*
      if(res.result=="success"){
          //save login info into Native Storage
          
          var encrypted:string=this.storageProvider.encryptValue('id',type);
          console.log("encrypted "+encrypted);
          this.nativeStorage.setItem('id',encodeURI(encrypted));
          this.storageProvider.setUserInfo(res.userInfo);
          this.storageProvider.setUserConfiguration(res.userInfo);
          
      }else{  // res.result="failure"  move into signup page
        if(!this.pushDid){
          this.pushDid=true;
          // set timer
          setTimeout(() => {
              this.pushDid=false;
          }, this.storageProvider.waitTime); //  seconds   
            this.navCtrl.push(SignupPage, { login:type});
        }
      }
 */     
    },login_err =>{
          console.log(JSON.stringify(login_err));
          let alert = this.alertCtrl.create({
              title: '로그인 에러가 발생했습니다',
              subTitle: '네트웍 상태를 확인하신후 다시 시도해 주시기 바랍니다.',
              buttons: ['OK']
          });
          alert.present();
    });
    
  }
  
}
