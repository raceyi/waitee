import { Component ,NgZone} from '@angular/core';
import { IonicPage, NavController, NavParams,App,Platform,AlertController,LoadingController } from 'ionic-angular';
import { SignupPage } from '../signup/signup';
import { PasswordResetPage} from '../password-reset/password-reset';
import {LoginMainPage} from '../login-main/login-main';
import {LoginProvider} from '../../providers/login/login';
import {StorageProvider} from '../../providers/storage/storage';
import { NativeStorage } from '@ionic-native/native-storage';
import {TabsPage} from '../tabs/tabs';
import {SignupPaymentPage} from '../signup-payment/signup-payment';
import { ServerProvider } from '../../providers/server/server';

/**
 * Generated class for the LoginEmailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var plugins:any;
declare var cordova:any;

@IonicPage()
@Component({
  selector: 'page-login-email',
  templateUrl: 'login-email.html',
})
export class LoginEmailPage {
  email:string;
  password:string;

  constructor(public navCtrl: NavController,
              private alertCtrl: AlertController,
              private loginProvider:LoginProvider,
              private storageProvider:StorageProvider,
              private nativeStorage: NativeStorage,              
              public navParams: NavParams,private app:App,
              private ngZone:NgZone,private platform:Platform,
              private serverProvider:ServerProvider,              
              public loadingCtrl: LoadingController) {
      if(platform.is("android")){
          var permissions = cordova.plugins.permissions;
          permissions.hasPermission(permissions.GET_ACCOUNTS,(status)=> {
            if (status.hasPermission ) {
              console.log("Yes :D ");
              plugins.DeviceAccounts.getEmail((info)=>{
                this.ngZone.run(()=>{
                  this.email=info;
                });
              });
            }
            else {
              console.warn("No :( ");
              permissions.requestPermission(permissions.GET_ACCOUNTS,(status)=>{
                if( status.hasPermission ){
                    console.log("call DeviceAccounts");
                    plugins.DeviceAccounts.getEmail((info)=>{
                      console.log("info:"+JSON.stringify(info));
                      this.ngZone.run(()=>{
                        this.email=info;
                      });
                  }); 
                }
              },(err)=>{

              });
            }
          },(err)=>{

          });
      }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginEmailPage');
  }

  emailReset(){
      this.app.getRootNavs()[0].push(PasswordResetPage);
  }


  back(){
        this.navCtrl.pop();
  }

  emailLogin(){
      console.log('emailLogin comes email:'+this.email+" password:"+this.password);    
      if(this.email.trim().length==0){
              let alert = this.alertCtrl.create({
                        title: '이메일을 입력해주시기 바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
          return;
      }
      if(this.password.trim().length==0){
                let alert = this.alertCtrl.create({
                        title: '비밀번호를 입력해주시기 바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
            return;
      }

       let loading = this.loadingCtrl.create({
            content: '로그인 중입니다.'
        });
      loading.present();
        setTimeout(() => {
            loading.dismiss();
        }, 5000);

      this.loginProvider.loginEmail(this.email,this.password).then((res:any)=>{
                                loading.dismiss();
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
                                    this.storageProvider.emailLogin=true;
                                    var encrypted:string=this.storageProvider.encryptValue('id',this.email);
                                    this.nativeStorage.setItem('id',encodeURI(encrypted));
                                    encrypted=this.storageProvider.encryptValue('password',this.password);
                                    this.nativeStorage.setItem('password',encodeURI(encrypted));

                                    console.log("email-shoplist:"+res.userInfo.shopList);
                                    if(res.userInfo.hasOwnProperty("shopList")){
                                        this.storageProvider.shoplistSet(JSON.parse(res.userInfo.shopList));
                                        this.serverProvider.shopListUpdate();
                                    }
                                    this.storageProvider.emailLogin=true;
                                    this.storageProvider.userInfoSetFromServer(res.userInfo);
                                    if(!res.userInfo.hasOwnProperty("cashId") || res.userInfo.cashId==null || res.userInfo.cashId==undefined){
                                        console.log("move into signupPaymentPage");
                                        this.navCtrl.setRoot(SignupPaymentPage);
                                    }else{
                                        console.log("move into TabsPage");
                                        this.navCtrl.setRoot(TabsPage);
                                    }
                                }else{
                                    let alert = this.alertCtrl.create({
                                                title: '회원 정보가 일치하지 않습니다.',
                                                buttons: ['OK']
                                            });
                                            alert.present().then(()=>{
                                              console.log("alert is done");
                                            });
                                }
                            },login_err =>{
                                loading.dismiss();
                                console.log(JSON.stringify(login_err));
                                let alert = this.alertCtrl.create({
                                        title: '로그인 에러가 발생했습니다',
                                        subTitle: '네트웍 상태를 확인하신후 다시 시도해 주시기 바랍니다.',
                                        buttons: ['OK']
                                    });
                                    alert.present();
                    }); 
  }

  signup(){
    this.app.getRootNavs()[0].push(SignupPage, { login:"email"});
  }

}
