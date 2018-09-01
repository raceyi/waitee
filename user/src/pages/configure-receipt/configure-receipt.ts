import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController} from 'ionic-angular';
import {ServerProvider} from '../../providers/server/server';
import {StorageProvider} from '../../providers/storage/storage';
import { NativeStorage } from '@ionic-native/native-storage';

/**
 * Generated class for the ConfigureReceiptPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-configure-receipt',
  templateUrl: 'configure-receipt.html',
})
export class ConfigureReceiptPage {
  receiptType='IncomeDeduction';
  receiptId="";

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private alertCtrl:AlertController,
              private serverProvider:ServerProvider,
              private nativeStorage:NativeStorage,
              private storageProvider:StorageProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConfigureReceiptPage');
  }

  back(){
    this.navCtrl.pop();
  }

  modify(){

      if(this.storageProvider.tourMode){
            let alert = this.alertCtrl.create({
                title: '둘러보기모드입니다.',
                buttons: ['OK']
            });
            alert.present();
            return;
      }
      if(this.receiptId.trim().length>0 && this.receiptId.trim().length<10){
            let alert = this.alertCtrl.create({
                title: '현금영수증 번호는 10자이상입니다.',
                buttons: ['OK']
            });
            alert.present();
            return;          
      }
      if(this.receiptId.trim().length>20){
            let alert = this.alertCtrl.create({
                title: '현금영수증 번호는 19자 이하 입니다.',
                buttons: ['OK']
            });
            alert.present();
            return;          
      }
        /////////////////////////////////////////
        //configure payment info
        console.log("configure payment info "+this.receiptId.trim().length);
        let receiptIssueVal:number;
        if(this.receiptId.trim().length>0)
            receiptIssueVal=1;
        else{
            receiptIssueVal=0;
        }
        let body;
            body= {email:this.storageProvider.email,
                              phone:this.storageProvider.phone, 
                              name:this.storageProvider.name,
                              receiptIssue:receiptIssueVal,
                              receiptId:this.receiptId,
                              receiptType:this.receiptType
                  };              
        console.log("modifyUserInfo:"+body);
        this.serverProvider.post(this.storageProvider.serverAddress+"/modifyUserInfo",body).then((res:any)=>{
            console.log("res:"+JSON.stringify(res));
            if(res.result=="success"){
                this.storageProvider.receiptIssue=receiptIssueVal==1?true:false;
                this.storageProvider.receiptId=this.receiptId;
                this.storageProvider.receiptType=this.receiptType;
                this.navCtrl.pop();
            }
        },(err)=>{
                        let alert = this.alertCtrl.create({
                            title: "현금 영수증 발급 정보 변경에 실패하였습니다.",
                            buttons: ['OK']
                        });
                        alert.present();
        });
  }

}
