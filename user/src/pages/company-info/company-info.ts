import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,Platform} from 'ionic-angular';
import { WebIntent } from '@ionic-native/web-intent';

/**
 * Generated class for the CompanyInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-company-info',
  templateUrl: 'company-info.html',
})
export class CompanyInfoPage {

  constructor(public navCtrl: NavController,
                private platform:Platform,
                private webIntent: WebIntent,       
              public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CompanyInfoPage');
  }

  back(){
    this.navCtrl.pop();
  }

  launchKakaoPlus(){
     console.log("launch KakaoPlus");
     if(this.platform.is('android')){
        const options = {
                        action: this.webIntent.ACTION_VIEW,
                        url: "kakaoplus://plusfriend/home/@웨이티"
                    };
        this.webIntent.startActivity(options);
     }else if(this.platform.is('ios')){
        window.open("kakaoplus://plusfriend/home/@웨이티");
     }
  }
}
