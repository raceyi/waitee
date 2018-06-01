import { Component } from '@angular/core';
import { IonicPage,App,Events, NavController, NavParams ,AlertController,LoadingController} from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import {CashTutorialPage} from '../cash-tutorial/cash-tutorial';

/**
 * Generated class for the InputCouponPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-input-coupon',
  templateUrl: 'input-coupon.html',
})
export class InputCouponPage {
  coupon;
  progressBarLoader;

  constructor(public navCtrl: NavController,
               public navParams: NavParams,
               private events:Events,
               private app:App,
               public storageProvider:StorageProvider,
               private serverProvider:ServerProvider,
               public loadingCtrl: LoadingController,                                          
               private alertCtrl:AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InputCouponPage');
  }

  input(){
      //register coupon
        let body = {cashId:this.storageProvider.cashId,couponName:this.coupon};

      this.progressBarLoader = this.loadingCtrl.create({
        content: "진행중입니다.",
        duration: 10000 //3 seconds
        });
      this.progressBarLoader.present();
      this.serverProvider.post(this.storageProvider.serverAddress+"/registerUserCoupon",body).then((res:any)=>{
          if(this.progressBarLoader)
                this.progressBarLoader.dismiss();          
          console.log("registerCoupon res:"+JSON.stringify(res));
          if(res.result=="success"){
            this.app.getRootNav().insert(1,CashTutorialPage);
            this.events.publish("cashUpdate",{cashListNoUpdate:true});
            //this.app.getRootNav().parent.select(3); 
            this.events.publish("myWalletPage");
            let alert = this.alertCtrl.create({
              title: '쿠폰이 등록되었습니다.',
              subTitle:"캐시 충전 가이드를 보신 이후 상단 X 버튼을 클릭하시면 지갑페이지로 이동합니다.",
              buttons: ['확인']
            });
            alert.present();
            this.navCtrl.pop();
            return;
          }
          if(res.result=="failure" && res.error=='AlreadyRegistered'){
                let alert = this.alertCtrl.create({
                    title: '이미 사용된 쿠폰입니다',
                    buttons: ['OK']
                });
                alert.present();
              return;
          }
          if(res.result=="failure" && res.error=='InvalidCoupon'){
                let alert = this.alertCtrl.create({
                    title: '일치하는 쿠폰이 없습니다.',
                    subTitle:"쿠폰이름을 확인해주세요",
                    buttons: ['OK']
                });
                alert.present();
              return;
          }
          if(res.result=="failure"){
                let alert = this.alertCtrl.create({
                    title: '쿠폰 등록에 실패하였습니다.',
                    buttons: ['OK']
                });
                alert.present();
          }
      },(err)=>{
                if(this.progressBarLoader)
                        this.progressBarLoader.dismiss();
                if(err=="NetworkFailure"){
                            let alert = this.alertCtrl.create({
                                title: "서버와 통신에 문제가 있습니다.",
                                buttons: ['OK']
                            });
                            alert.present();
                 }else{
                     let alert = this.alertCtrl.create({
                            title: '서버응답에 문제가 있습니다.',
                            buttons: ['OK']
                        });
                        alert.present();
                 }
      });
  }

  back(){
    console.log("back comes");
    this.navCtrl.pop();
  }
}
