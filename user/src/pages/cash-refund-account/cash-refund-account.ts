import { Component ,NgZone} from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import { NativeStorage } from '@ionic-native/native-storage';

/**
 * Generated class for the CashRefundAccountPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var cordova:any;

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
              private ngZone:NgZone,
              private alertController:AlertController,
              private serverProvider:ServerProvider,
              public nativeStorage:NativeStorage,
              private storageProvider:StorageProvider) {
         this.callback = this.navParams.get("callback");       

         cordova.plugins.clipboard.paste((text)=>{ 
             console.log("clipboard:"+text);
             this.ngZone.run(()=>{
                this.refundAccount=text; 
             })
        });
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
      if(this.storageProvider.tourMode){
            let alert = this.alertController.create({
                title: '둘러보기모드입니다.',
                buttons: ['OK']
            });
            alert.present();
            return;
      }
      
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
      
      console.log("refundBank:"+this.refundBank);
      if(this.refundBank.length==0){
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
      let body = {depositorName:this.storageProvider.name,
                                bankCode:this.refundBank.value ,account:this.refundAccount.trim()};
      this.serverProvider.post(this.storageProvider.serverAddress+"/registRefundAccount",body).then((res:any)=>{
          console.log("registRefundAccount res:"+JSON.stringify(res));
          if(res.result=="success"){
              // store info into local storage and convert button from registration into modification
              var encryptedBank:string=this.storageProvider.encryptValue('refundBank',this.refundBank.value);
              this.nativeStorage.setItem('refundBank',encodeURI(encryptedBank));
              var encrypted:string=this.storageProvider.encryptValue('refundAccount',this.refundAccount.trim());
              this.nativeStorage.setItem('refundAccount',encodeURI(encrypted));
              this.callback({refundAccount:this.refundAccount,refundBank: {name:this.refundBank.name,value:this.refundBank.value}}).then(()=>{
                this.navCtrl.pop();
              });
          }
          if(res.result=="failure"){
                let alert = this.alertController.create({
                    title: '환불계좌 등록에 실패하였습니다.',
                    subTitle: res.error,
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
                     console.log("Hum...checkDepositor-HttpError");
                 }

      });
  }
  

  clickBanklistShown(){
    this.bankListShown=!this.bankListShown;
  }
}
