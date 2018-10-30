import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,App,AlertController,Platform } from 'ionic-angular';
import { PolicyPage} from  '../policy/policy';
import {FaqPage} from '../faq/faq';
import {CompanyInfoPage} from '../company-info/company-info';
import {StorageProvider} from '../../providers/storage/storage';
import { LoginProvider } from '../../providers/login/login';
import { NativeStorage } from '@ionic-native/native-storage';
import { BackgroundMode } from '@ionic-native/background-mode';
import {LoginMainPage} from '../login-main/login-main';
import {CartProvider} from '../../providers/cart/cart';
import {ConfigureReceiptPage} from '../configure-receipt/configure-receipt';
import {ConfigurePasswordPage} from '../configure-password/configure-password';
import {ConfigurePaymentPage} from '../configure-payment/configure-payment';
import { InAppBrowser,InAppBrowserEvent } from '@ionic-native/in-app-browser';
import {ServerProvider} from '../../providers/server/server';
import {InputCouponPage} from '../input-coupon/input-coupon';


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
  browserRef;

  constructor(public navCtrl: NavController, public navParams: NavParams,
               private platform:Platform, 
                private alertCtrl:AlertController,
                private loginProvider:LoginProvider,
                private nativeStorage:NativeStorage,
                private backgroundMode:BackgroundMode,
                private cartProvider:CartProvider,
                private serverProvider:ServerProvider,
                private iab: InAppBrowser,
                private app: App,public storageProvider:StorageProvider) {

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

  modifyPhone(){
      if(this.storageProvider.tourMode){
            let alert = this.alertCtrl.create({
                title: '둘러보기모드입니다.',
                buttons: ['OK']
            });
            alert.present();
            return;
      }

  this.serverProvider.mobileAuth().then((res:any)=>{
      console.log("[phoneAuth]res:"+JSON.stringify(res));
      if(this.storageProvider.name!=res.userName){  //이름 변경시에는 고객센터에 요청바랍니다.
                    let alert = this.alertCtrl.create({
                        title: "고객님의 이름과 동일하지 않습니다. 이름 변경은 고객센터(0505-170-3636,help@takit.biz)에 연락바랍니다.",
                        buttons: ['OK']
                    });
                    alert.present();
      }
      console.log("birthYear:"+res.userAge+" phone:"+res.userPhone);
      let body= {email:this.storageProvider.email,
                    phone:res.userPhone, 
                    name:this.storageProvider.name,
                    receiptIssue:this.storageProvider.receiptIssue?1:0,
                    receiptId:this.storageProvider.receiptId,
                    receiptType:this.storageProvider.receiptType
        };              
        this.serverProvider.post(this.storageProvider.serverAddress+"/modifyUserInfo",body).then((res:any)=>{
            console.log("res:"+JSON.stringify(res));
            if(res.result=="success"){
                    let alert = this.alertCtrl.create({
                        title: "휴대폰 번호가 변경되었습니다.",
                        buttons: ['OK']
                    });
                    alert.present();
            }
        },(err)=>{
                    let alert = this.alertCtrl.create({
                        title: "휴대폰 번호 변경에 실패하였습니다.",
                        buttons: ['OK']
                    });
                    alert.present();
        });

  },(err)=>{
      console.log("[phoneAuth] err:"+JSON.stringify(err));
  });  
  }

  passwordValidity(password){
    var number = /\d+/.test(password);
    var smEng = /[a-z]+/.test(password);
    var bigEng= /[A-Z]+/.test(password);
    var special = /[^\s\w]+/.test(password);

    if(number && smEng && bigEng){
      return true;
    }
    else if(number && smEng && special){
      return true;
    }
    else if(bigEng && special && special){
      return true;
    }
    else if(bigEng && special && special){
      return true;
    }
    else{
      //this.paswordGuide = "영문대문자,영문소문자,특수문자,숫자 중 3개 이상 선택, 8자리 이상으로 구성하세요";
      return false;
    }
  }

  logout(){
    if(this.storageProvider.tourMode){
            let alert = this.alertCtrl.create({
                title: '둘러보기 모드입니다.',
                buttons: ['OK']
            });
            alert.present()
            return;
    }

    console.log("logout");
    let confirm = this.alertCtrl.create({
      title: '로그아웃하시겠습니까?',
      message: '타킷 사용을 위해 로그인이 필요합니다. 장바구니 정보는 삭제되며 주문,캐시 입금 알림도 중지됩니다.',
      buttons: [
        {
          text: '아니오',
          handler: () => {
            console.log('Disagree clicked');
            return;
          }
        },
        {
          text: '네',
          handler: () => {
            console.log('Agree clicked');
            this.loginProvider.logout(this.storageProvider.id).then((result)=>{
                console.log("fbProvider.logout() result:"+JSON.stringify(result));
                console.log("cordova.plugins.backgroundMode.disable");
                this.backgroundMode.disable();
                this.removeStoredInfo();
            },(err)=>{
                console.log("facebook-logout failure");
                console.log("logout err:"+err);
                if(err=="NetworkFailure"){
                      let alert = this.alertCtrl.create({
                          subTitle: '네트웍상태를 확인해 주시기바랍니다',
                          buttons: ['OK']
                      });
                      alert.present();
                }else{
                      let alert = this.alertCtrl.create({
                          subTitle: '로그아웃에 실패했습니다.',
                          buttons: ['OK']
                      });
                      alert.present();
                }
            });
          }
        }
      ]
    });
    confirm.present();
  }

  unregister(){
    if(this.storageProvider.tourMode){
            let alert = this.alertCtrl.create({
                title: '둘러보기 모드입니다.',
                buttons: ['OK']
            });
            alert.present()
            return;
    }
          
    console.log("unregister");
     let confirm = this.alertCtrl.create({
      title: '회원탈퇴를 하시겠습니까?',
      message: '거래 내역을 제외한 모든 개인정보는 삭제됩니다.',
      buttons: [
        {
          text: '아니오',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: '네',
          handler: () => {
            console.log('Agree clicked');
            //facebook logout, kakao logout
                this.loginProvider.unregister(this.storageProvider.id).then(()=>{
                    this.removeStoredInfo();
                    console.log("cordova.plugins.backgroundMode.disable");
                    this.backgroundMode.disable();
                },(err)=>{
                    console.log("unregister failure");
                    //move into error page
                    confirm.dismiss();
                    let noti = this.alertCtrl.create({
                        title: '회원탈퇴에 실패했습니다.',
                        buttons: ['OK']
                    });
                    noti.present();
                });
          }
        }
      ]
    });
    confirm.present();
  }
    
  removeStoredInfo(){
        this.nativeStorage.clear(); 
        this.nativeStorage.remove("id"); //So far, clear() doesn't work. Please remove this line later
        this.nativeStorage.remove("refundBank");
        this.nativeStorage.remove("refundAccount");
        this.storageProvider.reset();
        this.cartProvider.dropCartInfo().then(()=>{
            console.log("move into LoginPage"); //Please exit App and then restart it.
            this.app.getRootNav().setRoot(LoginMainPage);
        },(error)=>{
            console.log("fail to dropCartInfo");
            this.app.getRootNav().setRoot(LoginMainPage);
        });  
  }

  exitTourMode(){
    console.log("exit Tour Mode");
    this.app.getRootNav().pop();
  }

  enterCoupon(){
    this.app.getRootNav().push(InputCouponPage);  
  }
}
