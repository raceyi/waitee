import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';

/**
 * Generated class for the CashRefundAccountPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cash-refund-account',
  templateUrl: 'cash-refund-account.html',
})
export class CashRefundAccountPage {
  bankName;
  refundBank;
  refundAccount;
  bankListShown=false;
  callback;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private alertController:AlertController,
              private storageProvider:StorageProvider) {
         this.callback = this.navParams.get("callback");       
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CashRefundAccountPage');
  }

  bankSelect(bank){
      this.bankName=bank.name;
      this.refundBank=bank;
      this.bankListShown=false;
      console.log("bankListShown:"+this.bankListShown);
  }

  back(){
      this.navCtrl.pop();
  }

  checkWithrawAccount(){
      if(this.bankName.length==0){
            let alert = this.alertController.create({
                title: '은행을 선택해 주시기 바랍니다.',
                buttons: ['OK']
            });
            alert.present();
          return;
      }

      if(this.refundAccount.trim().length==0 ){
            let alert = this.alertController.create({
                title: '계좌번호를 입력해 주시기 바랍니다.',
                buttons: ['OK']
            });
            alert.present();
          return;
      }

      this.callback({refundAccount:this.refundAccount, refundBank:this.refundBank}).then(()=>{
        this.navCtrl.pop();
      });
  }

  clickBanklistShown(){
    this.bankListShown=!this.bankListShown;
  }
}
