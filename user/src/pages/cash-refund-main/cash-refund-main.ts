import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams, AlertController ,Events} from 'ionic-angular';
import {CashRefundAccountPage} from '../cash-refund-account/cash-refund-account';
import {ServerProvider} from '../../providers/server/server';
import {StorageProvider} from '../../providers/storage/storage';
import { NativeStorage } from '@ionic-native/native-storage';


/**
 * Generated class for the CashRefundMainPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cash-refund-main',
  templateUrl: 'cash-refund-main.html',
})
export class CashRefundMainPage {

  refundAccount;
  refundBank;
  refundAccountMask;
  refundAmount;
  refundFee;

  inProgress:boolean=false;
  public progressBarLoader : any;

  constructor(public navCtrl: NavController, public navParams: NavParams
              ,public alertCtrl:AlertController
              ,public loadingCtrl: LoadingController                           
              ,public storageProvider:StorageProvider
              ,public serverProvider:ServerProvider
              ,public nativeStorage:NativeStorage
              ,private events:Events) {

      if(this.storageProvider.tourMode){
            this.refundAccount="3012424363621";
            this.refundAccountMask="301*****63621";
            this.refundBank={name:"농협",value:"011"};
      }else{
            this.nativeStorage.getItem("refundBank").then((value:string)=>{
                console.log("refundBank is "+value);
                if(value!=null){
                    let bankValue=this.storageProvider.decryptValue("refundBank",decodeURI(value));
                    let bankName;
                    for(var i=0;i<this.storageProvider.banklist.length;i++)
                         if(this.storageProvider.banklist[i].value==bankValue){
                             bankName=this.storageProvider.banklist[i].name;
                         }
                    this.refundBank={name:bankName,value:bankValue};
                    this.nativeStorage.getItem("refundAccount").then((valueAccount:string)=>{
                        if(value!=null){
                            this.refundAccount=this.storageProvider.decryptValue("refundAccount",decodeURI(valueAccount));
                            this.refundAccountMask=this.maskAccount(this.refundAccount); /* mask except 3 digits at front and 5 digits at end */
                        }
                    },(err)=>{
                        console.log("fail to read refundAccount");
                    });
                }
            },(err)=>{
                console.log("refundBank doesn't exist");
            });
      }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CashRefundMainPage');
  }

  callbackFunction = (_params) =>{
    return new Promise((resolve,reject)=>{
       console.log("callbackFunction:"+JSON.stringify(_params));
       this.refundAccount = _params.refundAccount;
       this.refundBank = _params.refundBank;
       this.refundAccountMask=this.maskAccount(this.refundAccount); 
       resolve();
    })
  }

    maskAccount(account:string){
      if(account==undefined || account.length<9){
          return undefined;
      }
      var mask:string='*'.repeat(account.length-this.storageProvider.accountMaskExceptFront-this.storageProvider.accountMaskExceptEnd);
      var front:string=account.substr(0,this.storageProvider.accountMaskExceptFront);
      var end:string=account.substr(account.length-this.storageProvider.accountMaskExceptEnd,this.storageProvider.accountMaskExceptEnd);
      front.concat(mask, end);
      //console.log("front:"+front+"mask:"+mask+"end"+end);
      //console.log("account:"+ (front+mask+end));
      return (front+mask+end);
  }


  registerAccount(){
      this.navCtrl.push( CashRefundAccountPage,{callback:this.callbackFunction});
  }

  modifyAccount(){
      this.navCtrl.push( CashRefundAccountPage,{callback:this.callbackFunction});
  }

  refundCash(){
      if(this.storageProvider.tourMode){
            let alert = this.alertCtrl.create({
                title: '둘러보기모드입니다.',
                buttons: ['OK']
            });
            alert.present();
            return;
      }
      
      ///////////////////////////////////////////////
      // 가입 포인트 1000원만 인출하는 고객을 막기위해 추가함.
      /*
      if(this.storageProvider.shopList.length==0 && this.storageProvider.cashAmount<=1000){  // 1000원만 인출하는 고객을 막기위한 코드 
            let alert = this.alertCtrl.create({
                title: '가입 포인트는 주문없이는 인출이 불가능합니다.',
                buttons: ['OK']
            });
            alert.present();
          return;
      }*/

      if(this.refundAmount==undefined || this.refundAmount<=0){
            let alert = this.alertCtrl.create({
                title: '환불 금액은 0보다 커야 합니다.',
                buttons: ['OK']
            });
            alert.present();
          return;
      }

      this.checkWithrawFee().then((res:number)=>{
          console.log("checkWithdrawFee:"+res);
          if(res==0){
              this.refundFee=0;
              this.doWithraw();
          }else{
               let confirm = this.alertCtrl.create({
                    title: res+'원의 수수료가 차감됩니다.',
                    message: '환불을 진행하시겠습니까?',
                    buttons: [
                        {
                            text: '아니오',
                            handler: () => {
                                console.log('Disagree clicked');
                                this.refundFee=undefined;
                                return;
                            }
                        },
                        {
                            text: '네',
                            handler: () => {
                                this.refundFee=res;
                                this.doWithraw();
                            }
                        }]
                    });
               confirm.present();
          }
      },(err)=>{
          if(err=="NetworkFailure"){
                  let alert = this.alertCtrl.create({
                      title: '네트웍상태를 확인해 주시기바랍니다',
                      buttons: ['OK']
                  });
                  alert.present();
            }else if(err="checkWithrawFee"){
                    let alert = this.alertCtrl.create({
                        title: '환불이 불가능합니다.',
                        subTitle: '환불금액이 수수료보다 적습니다.',
                        buttons: ['OK']
                    });
                    alert.present();
            }else{
                    let alert = this.alertCtrl.create({
                        title: '환불에 실패했습니다.',
                        subTitle: '잠시후 다시 시도해 주시기 바랍니다.',//'네트웍상태를 확인해 주시기바랍니다',
                        buttons: ['OK']
                    });
                    alert.present();
            }
      });
  }

    checkWithrawFee(){
        return new Promise((resolve,reject)=>{

      let body = {bankCode:this.refundBank.value,
                                cashId:this.storageProvider.cashId};
            this.serverProvider.post(this.storageProvider.serverAddress+"/checkRefundCount",body).then((res:any)=>{
                console.log("checkRefundCount res: "+JSON.stringify(res));
                if(res.result=="success")
                    resolve(res.fee);
                else if(res.result=="failure")
                    reject(res.error);
            },(err)=>{
                reject(err);
            });
        });
  }


  doWithraw(){
      if(this.inProgress) return;
       this.inProgress=true;
        let body = {depositorName:this.storageProvider.name,
                                bankCode:this.refundBank.value ,
                                bankName:this.refundBank.name,
                                account:this.refundAccount.trim(),
                                cashId:this.storageProvider.cashId,
                                withdrawalAmount:this.refundAmount,
                                fee:this.refundFee};
      console.log("refundCash:"+body);
      this.progressBarLoader = this.loadingCtrl.create({
        content: "진행중입니다.",
        duration: 10000 //3 seconds
        });
      this.progressBarLoader.present();
      this.serverProvider.post(this.storageProvider.serverAddress+"/refundCash",body).then((res:any)=>{
          this.inProgress=false;
          if(this.progressBarLoader)
                this.progressBarLoader.dismiss();          
          console.log("refundCash res:"+JSON.stringify(res));
          if(res.result=="success"){
              //console.log("cashAmount:"+res.cashAmount);
              this.events.publish("cashUpdate");
              this.serverProvider.updateCash().then(()=>{
                let alert = this.alertCtrl.create({
                        title: '환불요청에 성공했습니다.',
                        subTitle: '환불계좌를 확인하시기 바랍니다',
                        buttons: ['OK']
                    });
                    alert.present();
                    this.navCtrl.pop();
              },err=>{
                let alert = this.alertCtrl.create({
                        title: '환불요청에 성공했습니다.',
                        subTitle: '환불계좌를 확인하시기 바랍니다',
                        buttons: ['OK']
                    });
                    alert.present();
                    this.navCtrl.pop();
              })
              return;
          }
          if(res.result=="failure" && res.error=='check your balance'){
                let alert = this.alertCtrl.create({
                    title: '잔액이 부족합니다.',
                    buttons: ['OK']
                });
                alert.present();
              return;
          }
          if(res.result=="failure" && res.error=='no deposit'){
                let alert = this.alertCtrl.create({
                    title: '지급된 캐쉬는 환불이 불가능합니다.',
                    buttons: ['OK']
                });
                alert.present();
              return;
          }
          if(res.result=="failure"){
                let alert = this.alertCtrl.create({
                    title: '환불에 실패하였습니다.',
                    buttons: ['OK']
                });
                alert.present();
          }
      },(err)=>{
                this.inProgress=false;
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
    this.navCtrl.pop();
  }
}
