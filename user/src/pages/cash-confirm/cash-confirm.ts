import { Component } from '@angular/core';
import { IonicPage, NavController,App, NavParams,ViewController,Events ,AlertController} from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {CashCancelChargePage} from '../cash-cancel-charge/cash-cancel-charge';
import {ServerProvider} from '../../providers/server/server';

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

  amount:number;
  bank;
  memo;

  timeString:string;
  tuno;

  inProgress=false;

  constructor(public navCtrl: NavController,
              public viewCtrl: ViewController,
              private alertController:AlertController,
              public storageProvider:StorageProvider, 
              public serverProvider:ServerProvider,
              public navParams: NavParams,
              private app:App,
              private events:Events) {

      console.log('CashConfirmPage -constructor custom:'+ JSON.stringify(navParams.get('custom')));
      let custom=navParams.get('custom');
      this.customStr=JSON.stringify(custom); 

      this.amount=parseInt(custom.amount);
      console.log("amount:"+this.amount);

      this.bank=custom.bankName;
      console.log("bank:"+this.bank);

      if(custom.hasOwnProperty("memo")){
            this.memo=custom.memo;
      }else{
            this.memo=custom.cashId;
      }

      //console.log("bank:"+this.memo);
      //console.log("!!!depositTime:"+custom.depositTime);
      //console.log("hasOwnProperty:"+ (custom.hasOwnProperty("depositTime")));
      //console.log("hasOwnProperty ?null:"+ custom.despositTime!='null');
      if(custom.hasOwnProperty("depositTime")&& custom.despositTime!='null'){
        if(custom.depositTime.includes('-')){ // iOS에서 custom.depositTime!=null 이 동작하지 않음. 다른 코드도 문제 없나 확인 필요함.
            //console.log("depositTime...");
            this.timeString=custom.depositTime.substr(0,4)+"."+custom.depositTime.substr(5,2)+"."+custom.depositTime.substr(8,2)
                            + custom.depositTime.substr(10,9);
            console.log("timeString:"+this.timeString);                
        }else{
            this.timeString=custom.depositTime.substr(0,4)+"."+custom.depositTime.substr(4,2)+"."+custom.depositTime.substr(6,2)
                            +" "+custom.depositTime.substr(8,2)+":"+ custom.depositTime.substr(10,2)+":"+ custom.depositTime.substr(12,2);
        }  
      }else if(custom.hasOwnProperty("depositDate") && custom.depositDate!='null'){ //Is it necessary? 
            this.timeString=custom.depositDate.substr(0,4)+"."+custom.depositDate.substr(5,2)+"."+custom.depositDate.substr(8,2);
            if(custom.hasOwnProperty("depositHour")){
                this.timeString+=" "+custom.depositHour;        
            }               
      }
      this.tuno=custom.cashTuno;
      //console.log("tuno:"+this.tuno);
      this.storageProvider.cashAddInProgress(this.customStr,viewCtrl);  
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CashConfirmPage');
  }


  dismiss() {
    this.removeDuplicate();
    this.viewCtrl.dismiss();
  }

  removeDuplicate(){
       this.storageProvider.cashRemoveInProgress(this.customStr,this.viewCtrl);
       //hum... just remove one? yes. Workaround code
       for(var i=0;i<this.storageProvider.cashInProgress.length;i++){
            console.log("removeDuplicate "+i+this.customStr);
            if(this.storageProvider.cashInProgress[i].cashStr==this.customStr){
                //console.log("0.removeView-hum..."+this.app.getRootNav().getViews().length);
                //console.log("1.removeView-hum..."+this.navController.getViews().length);
                console.log("removeView "+this.customStr);
                this.navCtrl.removeView(this.storageProvider.cashInProgress[i].viewController);
                this.storageProvider.cashInProgress.splice(i,1);
                 console.log("call splice with "+i);
                break;
           }
       }
  }

  deny(){
      var param:any={tuno:this.tuno,
                        depositAmount:this.amount,
                        depositBank:this.bank,
                        depositMemo:this.memo,
                        depositDate:this.timeString};
       this.removeDuplicate();      
       this.viewCtrl.dismiss();
       this.app.getRootNav().push(CashCancelChargePage,param);
  }

  charge(){
      if(!this.inProgress){
          this.inProgress=true;
          let body = {cashId:this.storageProvider.cashId, amount:this.amount, cashTuno:this.tuno};          
          console.log("cashInComplete:"+body);
          this.serverProvider.post(this.storageProvider.serverAddress+"/addCash",body).then((res:any)=>{
                    console.log("addCash:"+JSON.stringify(res));
                    if(res.result=="success"){
                      this.serverProvider.updateCash().then(()=>{
                            this.events.publish("cashUpdate");
                            this.removeDuplicate();
                            this.viewCtrl.dismiss();
                      },err=>{
                            this.removeDuplicate();
                            this.viewCtrl.dismiss(); 
                      })  
                    }else{ 
                          if(res.error=="already checked cash"){
                              let alert = this.alertController.create({
                                  title: "이미 확인된 입금입니다.",
                                  buttons: [
                                      {
                                          text:'OK',
                                          handler:()=>{
                                                console.log("이미 확인된 입금입니다.");
                                                this.removeDuplicate();
                                                this.viewCtrl.dismiss(); 
                                          }
                                       }]
                              });
                              alert.present();
                          }else{
                            let alert = this.alertController.create({
                                title: "캐쉬입금에 실패했습니다. 전체내역에서 입금 확인이 가능합니다.",
                                buttons: [
                                      {
                                          text:'OK',
                                          handler:()=>{
                                                this.removeDuplicate();
                                                this.viewCtrl.dismiss(); 
                                          }
                                       }]
                            });
                            alert.present();
                          }
                    }
                    this.inProgress=false;
          },(err)=>{
                   if(err=="NetworkFailure"){
                        let alert = this.alertController.create({
                            title: "서버와 통신에 문제가 있습니다.",
                            buttons: ['OK']
                        });
                        alert.present();
                    }else{
                            let alert = this.alertController.create({
                                title: "충전 확인에 실패했습니다. 잠시후 다시 시도해 주시기 바랍니다.",
                                buttons: ['OK']
                            });
                            alert.present();
                    }
                    this.inProgress=false;
          });         
      }else{
            let alert = this.alertController.create({
                title: "서버에 충전확인 요청 중입니다.",
                buttons: ['OK']
            });
            alert.present();
      }
  }
}
