import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController,App,Platform,IonicApp,MenuController,ViewController} from 'ionic-angular';
import { LoginEmailPage } from '../login-email/login-email';
import { NativeStorage } from '@ionic-native/native-storage';
import {StorageProvider} from '../../providers/storage/storage';
import { ServerProvider } from '../../providers/server/server';
import {LoginProvider} from '../../providers/login/login';
import { SignupPage } from '../signup/signup';
import {TabsPage} from '../tabs/tabs';
import {SignupPaymentPage} from '../signup-payment/signup-payment';

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

    isTestServer=false;
    tourModeSignInProgress=false;
    loginInProgress:boolean=false;

  constructor(public navCtrl: NavController, public navParams: NavParams
      ,private loginProvider:LoginProvider
      ,private platform: Platform
      ,private ionicApp: IonicApp
      ,public viewCtrl: ViewController
      ,private alertCtrl: AlertController
      ,private storageProvider:StorageProvider
      ,private serverProvider:ServerProvider
      ,private nativeStorage: NativeStorage
      ,private menuCtrl: MenuController
      ,private app:App) {

        if(this.storageProvider.serverAddress.endsWith('8000')){
            this.isTestServer=true;
        }            
  }

 ionViewDidEnter(){
    console.log("ionviewDidEnter-loginPage");
    this.loginInProgress=false;

}

  ionViewDidLoad() {
    console.log('ionViewDidLoad ....LoginMainPage');
  }

  emaillogin(){
    console.log("emailLogin comes");
    this.app.getRootNavs()[0].push(LoginEmailPage);
  }


  facebook(){
        if(this.loginInProgress) return;
        this.loginInProgress=true;
        this.socialLogin('facebook');
  }

  kakao(){
        if(this.loginInProgress) return;
        this.loginInProgress=true;
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
      this.loginInProgress=false;

      if(res.result=="success"){
          var encrypted:string=this.storageProvider.encryptValue('id',type);
          this.nativeStorage.setItem('id',encodeURI(encrypted));

          if(res.userInfo.hasOwnProperty("shopList")){
              this.storageProvider.shoplistSet(JSON.parse(res.userInfo.shopList));
              this.serverProvider.shopListUpdate();
          }
          this.storageProvider.emailLogin=false;
          this.storageProvider.userInfoSetFromServer(res.userInfo);
          if(!res.userInfo.hasOwnProperty("cashId") || res.userInfo.cashId==null || res.userInfo.cashId==undefined){
              console.log("move into signupPaymentPage");
              this.navCtrl.setRoot(SignupPaymentPage);
          }else{
              console.log("move into TabsPage");
              this.navCtrl.setRoot(TabsPage);
          }
      }else if(res.result=='failure' && res.error=='invalidId'){
          if(res.hasOwnProperty("email"))
              this.navCtrl.push(SignupPage,{login:type,id:res.id,email:res.email});          
          else 
              this.navCtrl.push(SignupPage,{login:type,id:res.id});
      }else{
          console.log("invalid result comes from server-"+JSON.stringify(res));
          let alert = this.alertCtrl.create({
              title: '카카오 로그인 에러가 발생했습니다',
              buttons: ['OK']
          });
          alert.present();
          //this.storageProvider.errorReasonSet('카카오 로그인 에러가 발생했습니다');
          //this.navController.setRoot(ErrorPage);
      }
    },login_err =>{
          this.loginInProgress=false;
          console.log(JSON.stringify(login_err));
          let alert = this.alertCtrl.create({
              title: '로그인 에러가 발생했습니다',
              subTitle: '네트웍 상태를 확인하신후 다시 시도해 주시기 바랍니다.',
              buttons: ['OK']
          });
          alert.present();
    });
    
  }
  
  tourLogin(){
      console.log("tour");
      if(!this.tourModeSignInProgress){
            this.tourModeSignInProgress=true;
            setTimeout(() => {
                console.log("reset tourModeSignInProgress:"+this.tourModeSignInProgress);
                this.tourModeSignInProgress=false;
            }, 1000); //  seconds  
            this.loginProvider.loginEmail(this.storageProvider.tourEmail,this.storageProvider.tourPassword).then((res:any)=>{
                console.log("emailLogin-login page:"+JSON.stringify(res));
                if(parseFloat(res.version)>parseFloat(this.storageProvider.version)){
                        let alert = this.alertCtrl.create({
                                        title: '앱버전을 업데이트해주시기 바랍니다.',
                                        subTitle: '현재버전에서는 일부 기능이 정상동작하지 않을수 있습니다.',
                                        buttons: ['OK']
                                    });
                            alert.present();
                }
                if(res.result=="success"){
                    this.storageProvider.tourMode=true;
                    if(res.userInfo.hasOwnProperty("shopList")){
                        this.storageProvider.shoplistSet(JSON.parse(res.userInfo.shopList));
                        this.serverProvider.shopListUpdate();
                    }
                    // show user cashId
                    /*
                    if(res.userInfo.hasOwnProperty("recommendShops")){
                        this.storageProvider.recommendations=res.userInfo.recommendShops;
                        this.storageProvider.recommendations.forEach(element => {
                            let strs=element.takitId.split("@");
                            element.name_sub = strs[0];
                            element.name_main= strs[1];
                            element.paymethod=JSON.parse(element.paymethod);
                            if(element.rate!=null){
                                let num:number=element.rate;
                                element.rate=num.toFixed(1);
                            }
                        });
                    }*/

                    this.storageProvider.cashId=res.userInfo.cashId;
                    this.storageProvider.name="타킷주식회사";
                    this.storageProvider.email="help@takit.biz";
                    this.storageProvider.phone="05051703636";
                    this.tourModeSignInProgress=false;

                    if(res.userInfo.hasOwnProperty("recommendShops")){
                        this.storageProvider.wholeStores=res.userInfo.recommendShops;
                        console.log("wholeStores:"+JSON.stringify(res.userInfo.recommendShops));
                        this.storageProvider.wholeStores.forEach(element => {
                            let strs=element.takitId.split("@");
                            element.name_sub = strs[0];
                            element.name_main= strs[1];
                            element.paymethod=JSON.parse(element.paymethod);
                            if(element.rate!=null){
                                let num:number=element.rate;
                                element.rate=num.toFixed(1);
                            }
                        });
                        this.storageProvider.recommendations=[];
                        this.storageProvider.wholeStores.forEach(shop=>{
                            console.log("shop.ready:"+shop.ready);
                            if(shop.ready==1){
                                this.storageProvider.recommendations.push(shop);
                            }
                        })
                    }
                    this.navCtrl.push(TabsPage);                    
                }else{
                    this.tourModeSignInProgress=false;
                    console.log("hum... tour id doesn't work.");
                }
            },(err)=>{
                this.tourModeSignInProgress=false;
                let alert = this.alertCtrl.create({
                    title: '네트웍 상태를 확인하신후 다시 시도해 주시기 바랍니다.',
                    buttons: ['OK']
                });
                alert.present();
            });
      }      
  }
}
