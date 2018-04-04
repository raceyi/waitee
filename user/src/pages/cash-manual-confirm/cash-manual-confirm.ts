import { Component } from '@angular/core';
import { LoadingController, IonicPage, NavController, NavParams ,AlertController,ModalController} from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import {CashConfirmPage} from '../cash-confirm/cash-confirm';

import * as moment from 'moment';
/**
 * Generated class for the CashManualConfirmPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cash-manual-confirm',
  templateUrl: 'cash-manual-confirm.html',
})
export class CashManualConfirmPage {
  bankName;
  bank;
  bankListShown=false;
  amount:number;
  memo:string;
  transferDate;
  bankCodeMode:boolean=false;
  bankCode:string;

  InProgress=false;
  public progressBarLoader : any;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public loadingCtrl: LoadingController,              
              private alertController:AlertController,
              private modalCtrl:ModalController,
              private serverProvider:ServerProvider,
              private storageProvider:StorageProvider) {
      this.defaultTransferDate();
  }

  ionViewDidLoad() {
      console.log('ionViewDidLoad CashManualConfirmPage');
  }

  back(){
      this.navCtrl.pop();
  }

  clickBanklistShown(){
    this.bankListShown=!this.bankListShown;
  }

  check(){
  }

  bankCodeInput(){
   this.bankCodeMode=true;
   this.bankListShown=false;
  }

  defaultTransferDate(){
    let d = new Date();

    let mm = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1); // getMonth() is zero-based
    let dd  = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
    let hh = d.getHours() <10? "0"+d.getHours(): d.getHours();
    let dString=d.getFullYear()+'-'+(mm)+'-'+dd+'T'+hh+":00"+moment().format("Z");

    this.transferDate=dString;          
  }

bankSelect(bank){
      this.bankCodeMode=false;
      this.bankName=bank.name;
      this.bank=bank;
      this.bankListShown=false;
      //console.log("bank:"+JSON.stringify(this.bank));
      //console.log("bankListShown:"+this.bankListShown);
  }


cashInComplete(){
      if(this.InProgress) return;
      this.InProgress=true;
      if(this.storageProvider.tourMode){
            this.InProgress=false;
            let alert = this.alertController.create({
                title: '둘러보기모드입니다.',
                buttons: ['OK']
            });
            alert.present();
            return;
      }

      if(this.amount==undefined){
            this.InProgress=false;          
            let alert = this.alertController.create({
                title: "입금액을 입력해주시기바랍니다.",
                buttons: ['OK']
            });
            alert.present();
            return;
      }

        //console.log("this.bank:"+JSON.stringify(this.bank));
        if(this.bank==undefined && (this.bankCodeMode && this.bankCode==undefined)){
            this.InProgress=false;            
            let alert = this.alertController.create({
                title: '입금 은행을 선택해주시기바랍니다',
                buttons: ['OK']
            });
            alert.present();
            return;
        }

      if(this.memo==undefined || this.memo.trim().length==0){
            this.InProgress=false;                      
             this.memo=this.storageProvider.name;
      }

      var transferHour=new Date(this.transferDate);
      let body;

      console.log("this.transferDate:"+this.transferDate);
      console.log("depositDate:"+transferHour.toISOString());

      let bank=this.bank.value;
      if(this.bankCodeMode)
          bank=this.bankCode;
      body = {
                depositTime:transferHour.toISOString(),
                amount: this.amount,
                bankCode: bank,
                depositMemo:this.memo,
                cashId:this.storageProvider.cashId
            };

      console.log("body:"+JSON.stringify(body));
      this.progressBarLoader = this.loadingCtrl.create({
        content: "진행중입니다.",
        duration: 10000 //3 seconds
        });
      this.progressBarLoader.present();

      this.serverProvider.post(this.storageProvider.serverAddress+"/checkCashUserself",body).then((res:any)=>{
                                    if(this.progressBarLoader)
                                        this.progressBarLoader.dismiss();
                                    console.log("res:"+JSON.stringify(res));
                                    if(res.result=="success"){
                                        if(res.cashlist){
                                            res.cashlist.forEach(cash=>{
                                                let cashConfirmModal= this.modalCtrl.create(CashConfirmPage, { custom: cash });
                                                cashConfirmModal.present(); 
                                            })
                                        }
                                      this.navCtrl.pop();  
                                    }else if(res.result=="failure" && res.error=="gcm:400"){
                                          let alert = this.alertController.create({
                                              title: '입금 확인 요청에 실패했습니다. 잠시후 다시 시도해 주시기 바랍니다.',
                                              buttons: ['OK']
                                          });
                                          alert.present();
                                    }else if(res.result=="failure" && res.error=="incorrect depositor"){
                                            let alert = this.alertController.create({
                                                title: '입력 내용을 확인하신후 다시 요청해주시기 바랍니다.',
                                                subTitle:'3회 연속오류시 본인인증이후 다시 시도해야 합니다.',
                                                buttons: ['OK']
                                            });
                                            alert.present();
                                   }else if(res.result=="failure" && res.error=="no service time"){
                                            let alert = this.alertController.create({
                                                title: "이용 제한시간입니다.",
                                                subTitle:"제한시간 이후 다시 시도 바랍니다.",
                                                buttons: ['OK']
                                            });
                                            alert.present();
                                    }else{
                                        let alert;
                                        if(res.error=="count excess"){
                                            this.serverProvider.mobileAuth().then((res:any)=>{
                                                if(res.userPhone!=this.storageProvider.phone){
                                                    let alert = this.alertController.create({
                                                        subTitle:"사용자 정보가 일치하지 않습니다.",
                                                        buttons: ['OK']
                                                    });
                                                    alert.present();
                                                }else{
                                                    this.resetFailureCount();
                                                }
                                            });
                                        }else{
                                              let alert = this.alertController.create({
                                                  title: "요청에 실패했습니다.",
                                                  subTitle:"잠시후 다시 시도해 주시기 바랍니다.",
                                                  buttons: ['OK']
                                              });
                                              alert.present();
                                        }
                                    }
                                },(err)=>{
                                           if(this.progressBarLoader) 
                                                this.progressBarLoader.dismiss();                                    
                                           this.InProgress=false;
                                           if(err=="NetworkFailure"){
                                                  let alert = this.alertController.create({
                                                      subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                                      buttons: ['OK']
                                                  });
                                                  alert.present();
                                            }else{
                                                  let alert = this.alertController.create({
                                                      title: "요청에 실패했습니다.",
                                                      subTitle:"잠시후 다시 시도해 주시기 바랍니다.",
                                                      buttons: ['OK']
                                                  });
                                                  alert.present();
                                            }
                                });
      
    }

    resetFailureCount(){
      this.serverProvider.post(this.storageProvider.serverAddress+"/resetManualFailure",{cashId:this.storageProvider.cashId}).then((res:any)=>{
                      let alert = this.alertController.create({
                          title: '오류 횟수가 0으로 설정되었습니다.',
                          subTitle:'입금 확인버튼을 클릭하여 다시 시도해 주시기바랍니다.',
                          buttons: ['OK']
                      });
                      alert.present();  
      },err=>{
                  if(err=="NetworkFailure"){
                        let alert = this.alertController.create({
                            subTitle: '네트웍상태를 확인해 주시기바랍니다',
                            buttons: ['OK']
                        });
                        alert.present();
                  }else{
                        let alert = this.alertController.create({
                            title: "요청에 실패했습니다.",
                            subTitle:"잠시후 다시 시도해 주시기 바랍니다.",
                            buttons: ['OK']
                        });
                        alert.present();
                  }
      });
    }
}
