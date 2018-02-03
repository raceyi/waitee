import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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

  cashId="TAKIT"
  amount="10000";
  dayOfWeek="월요일"; //"월요일,화요일,수요일,..."
  timeString:string="2017.11.13 월요일 22:30:15";
  bank="농협은행";

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    // let custom = {"cashTuno":"20170103075617278","cashId":"TAKIT02","transactionType":"deposit","amount":1,"transactionTime":"20170103","confirm":0,"bankName":"농협은행"}
    // let custom ={"depositMemo":"타킷 주식회사","amount":"100003","depositDate":"2017-01-06","branchName":"본점영업부","cashTuno":"20170106093158510","bankName":"농협"}
    let custom :any={"takitId":null,"orderName":null,"cashTuno":"1463","cashId":"TAKIT02","transactionType":"deposit","amount":"1","fee":null,"nowBalance":null,"transactionTime":"2018-02-02 03:23:23","orderId":null,"depositTime":"2018-02-02 12:23:16","depositDate":null,"depositHour":null,"bankCode":"011","bankName":"농협","branchCode":null,"branchName":null,"account":null,"confirm":"0","displayTime":"18/02/02 12:23"};

  console.log("custom.depositTime:"+custom.depositTime);
  if(custom.hasOwnProperty("depositTime") && custom.depositTime!=null){
            this.timeString=custom.depositTime.substr(0,4)+"."+custom.depositTime.substr(5,2)+"."+custom.depositTime.substr(8,2)
                            + custom.depositTime.substr(10,8);
            console.log("timeString:"+this.timeString);                
      }else if(custom.hasOwnProperty("depositDate") && custom.depositDate!=null){ //Is it necessary? 
            this.timeString=custom.depositDate.substr(0,4)+"."+custom.depositDate.substr(5,2)+"."+custom.depositDate.substr(8,2);
            if(custom.hasOwnProperty("depositHour")){
                this.timeString+=" "+custom.depositHour;        
            }               
      }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CashConfirmPage');
  }

}
