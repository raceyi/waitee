import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController,Events } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';

/**
 * Generated class for the CashConfirmPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cash-confirm',
  templateUrl: 'cash-confirm.html',
})
export class CashConfirmPage {
  custom;
  customStr;

  cashId="TAKIT"
  amount="10000";
  dayOfWeek="월요일"; //"월요일,화요일,수요일,..."
  timeString:string="2017.11.13 월요일 22:30:15";
  bank="농협은행";

  constructor(public navCtrl: NavController,
              public viewCtrl: ViewController,
              public storageProvider:StorageProvider, 
              public navParams: NavParams,
              private events:Events) {
     let custom = {"cashTuno":"20170103075617278","cashId":"TAKIT02","transactionType":"deposit","amount":1,"transactionTime":"20170103","confirm":0,"bankName":"농협은행"}
    
      //let custom=params.get('custom');
      this.customStr=JSON.stringify(custom);

    // let custom ={"depositMemo":"타킷 주식회사","amount":"100003","depositDate":"2017-01-06","branchName":"본점영업부","cashTuno":"20170106093158510","bankName":"농협"}
      this.storageProvider.cashAddInProgress(this.customStr,viewCtrl);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CashConfirmPage');
  }


  dismiss() {
    this.removeDuplicate();
    this.viewCtrl.dismiss();
    this.events.publish("cashUpdate");
  }

  removeDuplicate(){
       this.storageProvider.cashRemoveInProgress(this.customStr,this.viewCtrl);
       //hum... just remove one? yes. Workaround code
       for(var i=0;i<this.storageProvider.cashInProgress.length;i++){
            console.log("removeDuplicate "+i);
            if(this.storageProvider.cashInProgress[i].cashStr==this.customStr){
                //console.log("0.removeView-hum..."+this.app.getRootNav().getViews().length);
                //console.log("1.removeView-hum..."+this.navController.getViews().length);
                //console.log("removeView "+this.customStr);
                this.navCtrl.removeView(this.storageProvider.cashInProgress[i].viewController);
                this.storageProvider.cashInProgress.splice(i,1);
                 console.log("call splice with "+i);
                break;
           }
       }
  }
}
