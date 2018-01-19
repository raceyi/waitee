import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,App,Platform ,AlertController} from 'ionic-angular';
import {CashRefundMainPage} from '../cash-refund-main/cash-refund-main';
import {CashChargePage} from '../cash-charge/cash-charge';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import {StorageProvider} from '../../providers/storage/storage';

import * as moment from 'moment';

var gWalletPage;
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
  browserRef;
  done:boolean=false;
  search_mode="full";
  startDate="";
  endDate="";
  paymethods=[];

  //paymethods=[{name:"비자카드",type:"card"},
  //            {name:"마스터카드",type:"card"},
  //            {name:"휴대폰결제",tyep:"phone"}
  //];
  
  cashList;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private app:App,
              private platform:Platform,
              private alertController:AlertController,
              public storageProvider:StorageProvider,
              private iab: InAppBrowser) {
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

   gWalletPage=this;
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

   registerCard(){
    return new Promise((resolve,reject)=>{
    let customer_uid=this.storageProvider.email+'_'+new Date().getTime();
    console.log("customer_uid:"+customer_uid);
    let param={
            pay_method : 'card', // 'card'만 지원됩니다.
            merchant_uid : 'merchant_' + new Date().getTime(), // 결제건별로 고유한 값을 지정합니다.
            name : '최초인증결제',
            amount : 0, // 빌링키 발급
            customer_uid : customer_uid, //customer_uid 파라메터가 있어야 빌링키 발급을 시도합니다. 한번 등록된 값을 가지고 결제를 수행함으로 고객의 등록카드별로 다른값을 사용하시기 바랍니다.
            buyer_email : 'iamport@siot.do',
            buyer_name : '아임포트',
            buyer_tel : '02-1234-1234'
        }

    const redirectUrl = "http://takit.biz:8000/oauth";//It brings about load error. Please change it with your server address
    let localfile;
    if(this.platform.is('android')){
        console.log("android");
        localfile='file:///android_asset/www/assets/iamport.html';
    }else if(this.platform.is('ios')){
        console.log("ios");
        localfile='assets/iamport.html';
    }
    this.browserRef=this.iab.create(localfile,"_blank");
    this.browserRef.on("loadstart").subscribe(function (e) {
        if (e.url.startsWith(redirectUrl)) {
            if(gWalletPage.browserRef!=undefined){
                console.log("call gBrowserRef.close");
                gWalletPage.browserRef.close(); 
            }else
                console.log("this.browserRef is undefined");
            gWalletPage.done=true;
            console.log("result:"+e.url);
            if(e.url.includes("imp_success=true")){
                console.log("cert success");
                resolve();
            }else
                console.log("cert failure");            
                reject();
        }
    });
    this.browserRef.on("loaderror").subscribe((event)=>{
        console.log("loaderror:"+event.url);
        gWalletPage.done=true; // Please change redirectUrl with your server address to prevent loaderror;
        if(gWalletPage.browserRef!=undefined){
                console.log("call this.browserRef.close");
                gWalletPage.browserRef.close();
        }
    });
    this.browserRef.on("loadstop").subscribe((event)=>{
        console.log("loadstop event comes "+event.url);
        if(gWalletPage.done){ 
            if(gWalletPage.browserRef!=undefined){
                console.log("close browser");
                gWalletPage.browserRef.close();
            }else
                console.log("browserRef undefined");            
            return;
        }
        let url:string=event.url;
        if(url.endsWith('iamport.html')){ 
            const inlineCallback = `(rsp) => {
                if( rsp.success ) {
                    location.href = '${redirectUrl}?imp_success=true&imp_uid='+rsp.imp_uid+'&merchant_uid='+rsp.merchant_uid;
                } else {
                    location.href = '${redirectUrl}?imp_success=false&imp_uid='+rsp.imp_uid+'&merchant_uid='+rsp.merchant_uid+'&error_msg='+rsp.error_msg;
                }
            }`;
            const iamport_script = `IMP.request_pay(${JSON.stringify(param)}, ${inlineCallback})`;
            this.browserRef.executeScript({
                code : iamport_script
            });
        }
    });
    this.browserRef.on("exit").subscribe(
        (e) => {
            console.log("gWalletPage.done:"+gWalletPage.done)
            if(!gWalletPage.done){
                let alert = this.alertController.create({
                    title: '사용자가 결제를 취소하였습니다.',
                    buttons: ['OK']
                });
                alert.present();
            }else{
                console.log("browser close");
            }
        }
    );
    });
  }

}
