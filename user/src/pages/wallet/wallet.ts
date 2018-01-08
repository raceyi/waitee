import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,App } from 'ionic-angular';
import {CashRefundMainPage} from '../cash-refund-main/cash-refund-main';
import {CashChargePage} from '../cash-charge/cash-charge';
import * as moment from 'moment';
/**
 * Generated class for the WalletPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-wallet',
  templateUrl: 'wallet.html',
})
export class WalletPage {
  search_mode="full";
  startDate="";
  endDate="";
  paymethods=[{name:"비자카드",type:"card"},
              {name:"마스터카드",type:"card"},
              {name:"휴대폰결제",tyep:"phone"}
  ];
  cashList;

  constructor(public navCtrl: NavController, public navParams: NavParams,private app:App) {
    var date=new Date();
    var month=date.getMonth()+1;

    this.startDate=this.getTodayString();
    this.endDate=this.getTodayString();
    
    //주문 취소일 경우 takitId가 필요하다. 서버단 수정필요함
    this.cashList=[{"takitId":"TEST2@TAKIT","orderName":"바닐라라떼(1)","cashTuno":"1456","cashId":"TAKIT02","transactionType":"payment","amount":"0","fee":null,"nowBalance":"26554","transactionTime":"2018-01-02 07:53:18","orderId":"1490","depositTime":null,"depositDate":null,"depositHour":null,"bankCode":null,"bankName":null,"branchCode":null,"branchName":null,"account":null,"confirm":"1"},
                   {"takitId":"TEST2@TAKIT","orderName":"아메리카노(1)","cashTuno":"1447","cashId":"TAKIT02","transactionType":"payment","amount":"0","fee":null,"nowBalance":"26554","transactionTime":"2017-12-26 00:20:49","orderId":"1485","depositTime":null,"depositDate":null,"depositHour":null,"bankCode":null,"bankName":null,"branchCode":null,"branchName":null,"account":null,"confirm":"1"},
                   {"takitId":null,"orderName":null,"cashTuno":"1445","cashId":"TAKIT02","transactionType":"refund","amount":"1","fee":"0","nowBalance":"26554","transactionTime":"2017-12-22 07:22:06","orderId":null,"depositTime":null,"depositDate":null,"depositHour":null,"bankCode":null,"bankName":"우리","branchCode":null,"branchName":null,"account":"1002330959408","confirm":null},
                   {"takitId":"TEST2@TAKIT","orderName":null,"cashTuno":"1444","cashId":"TAKIT02","transactionType":"cancel","amount":"0","fee":null,"nowBalance":"26555","transactionTime":"2017-12-20 05:04:36","orderId":null,"depositTime":null,"depositDate":null,"depositHour":null,"bankCode":null,"bankName":null,"branchCode":null,"branchName":null,"account":null,"confirm":"1"},
                   {"takitId":"TEST2@TAKIT","orderName":"바닐라라떼(1)","cashTuno":"1443","cashId":"TAKIT02","transactionType":"payment","amount":"0","fee":null,"nowBalance":"26555","transactionTime":"2017-12-20 05:00:35","orderId":"1484","depositTime":null,"depositDate":null,"depositHour":null,"bankCode":null,"bankName":null,"branchCode":null,"branchName":null,"account":null,"confirm":"1"},
                   {"takitId":null,"orderName":null,"cashTuno":"1348","cashId":"TAKIT02","transactionType":"deposit","amount":"1","fee":null,"nowBalance":null,"transactionTime":"2017-09-04 02:25:38","orderId":null,"depositTime":"2017-09-04 11:25:26","depositDate":null,"depositHour":null,"bankCode":"011","bankName":"농협","branchCode":null,"branchName":null,"account":null,"confirm":"0"},
                   {"takitId":null,"orderName":null,"cashTuno":"1342","cashId":"TAKIT02","transactionType":"deposit","amount":"1","fee":null,"nowBalance":"26555","transactionTime":"2017-09-03 00:04:16","orderId":null,"depositTime":"2017-09-03 09:04:08","depositDate":null,"depositHour":null,"bankCode":"011","bankName":"농협","branchCode":null,"branchName":null,"account":null,"confirm":"1"},
                   {"takitId":"TEST2@TAKIT","orderName":"아메리카노(1)","cashTuno":"1340","cashId":"TAKIT02","transactionType":"payment","amount":"0","fee":null,"nowBalance":"26553","transactionTime":"2017-08-31 05:52:32","orderId":"1417","depositTime":null,"depositDate":null,"depositHour":null,"bankCode":null,"bankName":null,"branchCode":null,"branchName":null,"account":null,"confirm":"1"},
                   {"takitId":"TEST2@TAKIT","orderName":"아메리카노(1)","cashTuno":"1339","cashId":"TAKIT02","transactionType":"payment","amount":"0","fee":null,"nowBalance":"26553","transactionTime":"2017-08-31 05:50:59","orderId":"1416","depositTime":null,"depositDate":null,"depositHour":null,"bankCode":null,"bankName":null,"branchCode":null,"branchName":null,"account":null,"confirm":"1"},
                   {"takitId":"TEST2@TAKIT","orderName":"아메리카노(1)","cashTuno":"1338","cashId":"TAKIT02","transactionType":"payment","amount":"0","fee":null,"nowBalance":"26553","transactionTime":"2017-08-31 05:44:17","orderId":"1415","depositTime":null,"depositDate":null,"depositHour":null,"bankCode":null,"bankName":null,"branchCode":null,"branchName":null,"account":null,"confirm":"1"}];

   this.cashList.forEach(element => {
       element.displayTime = this.getDisplayTime(element.transactionTime);
       if(element.takitId!=null){
            let strs=element.takitId.split("@");
            element.brand  =strs[0];
            element.service=strs[1];
       }
   });
  }


  getDisplayTime(measureTime){
    return measureTime[2]+measureTime[3]+"/"+
          measureTime[5]+measureTime[6]+"/"+
          measureTime[8]+measureTime[9]+" "+
          measureTime[11]+measureTime[12]+":"+
          measureTime[14]+measureTime[15];
  }

  getTodayString(){
    let d = new Date();

    let mm = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1); // getMonth() is zero-based
    let dd  = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
    let hh = d.getHours() <10? "0"+d.getHours(): d.getHours();
    let dString=d.getFullYear()+'-'+(mm)+'-'+dd+'T'+hh+":00"+moment().format("Z");

    return dString;          
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WalletPage');
  }

  configureSearchMode(){
      this.search_mode="period";
  }

  closeSearchMode(){
    this.search_mode="full";
  }

  startPicker(startDate){

  }

  endPicker(endDate){

  }

  search(){

  }

  refundCash(){
    this.app.getRootNavs()[0].push(CashRefundMainPage);
  }

  chargeCash(){
    this.app.getRootNavs()[0].push(CashChargePage);
  }
}
