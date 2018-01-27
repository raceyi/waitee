import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,App,AlertController } from 'ionic-angular';
import { PolicyPage} from  '../policy/policy';
import {FaqPage} from '../faq/faq';
import {CompanyInfoPage} from '../company-info/company-info';
import {StorageProvider} from '../../providers/storage/storage';
import { LoginProvider } from '../../providers/login/login';
import { NativeStorage } from '@ionic-native/native-storage';
import { BackgroundMode } from '@ionic-native/background-mode';
import {LoginMainPage} from '../login-main/login-main';
import {CartProvider} from '../../providers/cart/cart';

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
  constructor(public navCtrl: NavController, public navParams: NavParams,
                private alertCtrl:AlertController,
                private loginProvider:LoginProvider,
                private nativeStorage:NativeStorage,
                private backgroundMode:BackgroundMode,
                private cartProvider:CartProvider,
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

}
