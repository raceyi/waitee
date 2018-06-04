import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,App,AlertController,Events } from 'ionic-angular';
import {ServerProvider} from '../../providers/server/server';
import {StorageProvider} from '../../providers/storage/storage';
/**
 * Generated class for the CashCancelChargePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cash-cancel-charge',
  templateUrl: 'cash-cancel-charge.html',
})
export class CashCancelChargePage {
  custom;

  memo;
  amount:number;

  timeString:string;
  bank:string;
  tuno;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private alertController:AlertController,
              private serverProvider:ServerProvider,
              private storageProvider:StorageProvider,
              private events:Events,
              private app:App) {
      this.tuno=navParams.get('tuno');
      this.amount=navParams.get('depositAmount');
      this.bank=navParams.get('depositBank');
      this.memo=navParams.get('depositMemo');
      this.timeString=navParams.get('depositDate');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CashCancelChargePage');
  }

  deleteDepositInput(){
    let body = {cashTuno:this.tuno};
          
    console.log("removeWrongCashList:"+body);
    this.serverProvider.post(this.storageProvider.serverAddress+"/removeWrongCashList",body).then((res:any)=>{
            console.log("removeWrongCashList:"+JSON.stringify(res));
            if(res.result=="success"){
                this.events.publish("cashUpdate");
                this.serverProvider.updateCash().then(()=>{
                    this.app.getRootNav().pop();
                },(err)=>{
                    this.app.getRootNav().pop();
                })
            }else{
                  let alert = this.alertController.create({
                      title: "캐쉬입금 삭제에 실패했습니다. 잠시후 다시 시도해 주시기 바랍니다.",
                      subTitle:res.error,
                      buttons: ['OK']
                  });
                  alert.present();
            }
    },(err)=>{
                    if(err=="NetworkFailure"){
                        let alert = this.alertController.create({
                            title: "서버와 통신에 문제가 있습니다.",
                            buttons: ['OK']
                        });
                        alert.present();
                    }else{
                            let alert = this.alertController.create({
                                title: "캐쉬입금 삭제에 실패했습니다. 잠시후 다시 시도해 주시기 바랍니다.",
                                buttons: ['OK']
                            });
                            alert.present();
                    }
    });

  }

  dismiss(){
    this.app.getRootNav().pop();
  }

  back(){
    this.navCtrl.pop();
  }
}
