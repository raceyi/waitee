import { Component } from '@angular/core';
import { Platform ,App} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {UserinfoPage} from '../pages/userinfo/userinfo';
import {ShopInfoPage} from '../pages/shop-info/shop-info';
import {ConfigurePasswordPage} from '../pages/configure-password/configure-password';
import {StorageProvider} from '../providers/storage/storage';
import {ShoptablePage} from '../pages/shoptable/shoptable';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  //rootPage:any = HomePage;
  //rootPage:any =UserinfoPage;
  //rootPage:any =ShopInfoPage;
  //rootPage:any =ConfigurePasswordPage;
  rootPage:any =ShoptablePage;

  constructor(platform: Platform,
              public app:App,
              public storageProvider:StorageProvider,
              statusBar: StatusBar, 
              splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
/*
  openPrint(){
        this.app.getRootNav().push(PrinterPage);
   }

   openServiceInfo(){
        this.app.getRootNav().push(ServiceInfoPage);
   }

   openCash(){
        this.app.getRootNav().push(CashPage);
   }
*/
    openUserInfo(){
        this.app.getRootNav().push(UserinfoPage);
    }
/*
    openSales(){
        this.app.getRootNav().push(SalesPage);
    }

    openEditMenu(){
        this.app.getRootNav().push(EditMenuPage)
    }

    openSoldOut(){
        this.app.getRootNav().push(SoldOutPage)
    }

   openLogout(){
      if(this.storageProvider.tourMode){
            let alert = this.alertCtrl.create({
                        title: '둘러보기 모드에서는 동작하지 않습니다.',
                        buttons: ['OK']
                    });
            alert.present();
        return;
      }
      let confirm = this.alertCtrl.create({
      title: '로그아웃하시겠습니까?',
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
            console.log('Logout Agree clicked');
            console.log("cordova.plugins.backgroundMode.disable");
            cordova.plugins.backgroundMode.disable();
            
                this.emailProvider.logout().then(()=>{
                    this.removeStoredInfo();
                },(err)=>{
                    this.removeStoredInfo();
                });
          }
        }
      ]
    });
    confirm.present();
   }
*/   
}

