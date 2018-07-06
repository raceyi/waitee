import { Component } from '@angular/core';
import { IonicPage, NavController,Events, NavParams,App,Platform ,ModalController,AlertController} from 'ionic-angular';
import {CashRefundMainPage} from '../cash-refund-main/cash-refund-main';
import {CashChargePage} from '../cash-charge/cash-charge';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import { CardProvider } from '../../providers/card/card';
import {TimeUtil} from '../../classes/TimeUtil';
import {CashTutorialPage} from '../cash-tutorial/cash-tutorial';
import {CashConfirmPage} from '../cash-confirm/cash-confirm';
import {TossTransferPage} from '../toss-transfer/toss-transfer';

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
   timeUtil= new TimeUtil(); 
  
  search_mode="full";
  startDate=""; //고객 입력값
  endDate="";   //고객 입력값
  
  cashList=[];
  lastTuno;
  infiniteScroll;
  periodSearch:boolean=false;

  periodStartTime; //고객 검색 설정값
  periodEndTime;   //고객 검색 설정값

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private app:App,
              private platform:Platform,
              private alertController:AlertController,
              public storageProvider:StorageProvider,
              public serverProvider:ServerProvider,
              public modalCtrl: ModalController,
              private events:Events,              
              private cardProvider: CardProvider) {
    var date=new Date();
    var month=date.getMonth()+1;

    this.startDate=this.getTodayString();
    this.endDate=this.getTodayString();

       events.subscribe('cashUpdate', (param) =>{
        console.log("cashUpdate comes at WalletPage "+JSON.stringify(param));
        if(param!=undefined && param.cashListNoUpdate){
            //just ignore it
        }else{
            this.startDate=this.getTodayString();
            this.endDate=this.getTodayString();    
            this.periodSearch=false;
            this.refreshCashList();
        }
    });    
  }

/*
  getDisplayTime(measureTime){    
// workaround code for iOS
     let hourH=parseInt(measureTime[11]);
     let hourL=parseInt(measureTime[12]);
     let hour=hourH*10+hourL;
     hour=(hour+9)%24;

    return measureTime[2]+measureTime[3]+"/"+
          measureTime[5]+measureTime[6]+"/"+
          measureTime[8]+measureTime[9]+" "+
          hour+":"+
          measureTime[14]+measureTime[15];

  }
*/
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

  ionViewWillEnter() {
    console.log('ionViewWillEnter WalletPage');
    this.startDate=this.getTodayString();
    this.endDate=this.getTodayString();    
    this.periodSearch=false;
    this.refreshCashList();

    // cash정보가 업데이트 되지 않는 경우가 있다. 이경우 보안책으로 다른 탭으로 이동했다 다시왔을때라도 보여주자.
            if(this.storageProvider.cashId!=undefined && this.storageProvider.cashId.length>=5){
            let body = {cashId:this.storageProvider.cashId};

            this.serverProvider.post(this.storageProvider.serverAddress+"/getBalanceCash",body).then((res:any)=>{
                console.log("getBalanceCash res:"+JSON.stringify(res));
                if(res.result=="success"){
                    this.storageProvider.cashAmount=res.balance;
                }else{
                    let alert = this.alertController.create({
                        title: "캐시정보를 가져오지 못했습니다.",
                        buttons: ['OK']
                    });
                    alert.present();
                }
            });
        }

  }

  refreshCashList(){
    if(this.infiniteScroll!=undefined)
        this.infiniteScroll.enable(true); //stop infinite scroll
    console.log("reset cashList");    
    this.cashList=[]; // refresh  when it enters this page.
    this.lastTuno=-1;
    this.getCashLists().then((value)=>{
        console.log("getCashList done continue"+value);
        if(value){
            console.log("more is true");
            if(this.infiniteScroll!=undefined)
                this.infiniteScroll.complete();
        }else{
            console.log("more is false");
            if(this.infiniteScroll!=undefined)
                this.infiniteScroll.enable(false); //stop infinite scroll
        }
    });
  }

  getCashLists(){
        return new Promise((resolve, reject)=>{
            let body;
            if(this.periodSearch){
                  body = {cashId:this.storageProvider.cashId,
                                lastTuno: this.lastTuno,
                                startGMTTime: this.periodStartTime,
                                endGMTTime:  this.periodEndTime,
                                limit: this.storageProvider.TransactionsInPage};
            }else{
                  body = {cashId:this.storageProvider.cashId,
                                lastTuno: this.lastTuno,
                                limit: this.storageProvider.TransactionsInPage};
            }
            this.serverProvider.post( this.storageProvider.serverAddress+"/getCashList",body).then((res:any)=>{
                    console.log("res:"+JSON.stringify(res));
                    if(res.result=="success" && Array.isArray(res.cashList)){
                        this.lastTuno=res.cashList[res.cashList.length-1].cashTuno;
                        res.cashList.forEach(element => {
                            //element.displayTime = this.getDisplayTime(element.transactionTime);
                            let localTimeString=this.timeUtil.getlocalTimeStringWithoutDay(element.transactionTime);                             
                            element.displayTime =  localTimeString.substr(9,5); 
                            element.displayDate =  localTimeString.substr(0,8);
                            if(element.takitId!=null){
                                  let strs=element.takitId.split("@");
                                  element.brand  =strs[0];
                                  element.service=strs[1];
                            }
                        });
                        this.cashList=this.cashList.concat(res.cashList);
                        console.log("cashList:"+JSON.stringify(this.cashList));
                        if(res.cashList.length<this.storageProvider.TransactionsInPage){
                              resolve(false); // no more 
                        }else{
                              resolve(true); // more  can be shown.
                        }
                    }else if(res.result=="success" && res.cashList=="0"){ //Please check if it works or not
                        console.log("no more orders");
                        resolve(false);
                    }else{ 
                        reject("serverFailure");
                    }
            },(err)=>{
                    let alert = this.alertController.create({
                        title: '서버와 통신에 문제가 있습니다',
                        subTitle: '네트웍상태를 확인해 주시기바랍니다',
                        buttons: ['OK']
                    });
                    alert.present();              
                    reject(err);
            });
        });
  }

  doInfinite(infiniteScroll) {
    console.log('Begin async operation');
    this.infiniteScroll=infiniteScroll;
    this.getCashLists().then((more)=>{
      if(more){
          console.log("more is true");
          infiniteScroll.complete();
      }else{
          console.log("more is false");
          infiniteScroll.enable(false); //stop infinite scroll
      }
    },err=>{
          // hum...
    });
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

  searchPeriod(){ //기간 검색 
    var startDate=new Date(this.startDate);
    var endDate=new Date(this.endDate);
    var currDate=new Date(); 
    if(startDate.getTime()>endDate.getTime()){
          let alert = this.alertController.create({
              title: '시작일은 종료일보다 늦을수 없습니다',
              buttons: ['OK']
          });
          alert.present();
         return;
    }
    if(endDate.getTime()>currDate.getTime()){
          let alert = this.alertController.create({
              title: '종료일은 현재시점보다 늦을수 없습니다.',
              buttons: ['OK']
          });
          alert.present();
         return;
    }

    startDate.setHours(0,0,0,0);
    endDate.setHours(23,59,59,999);
    this.periodStartTime= startDate.toISOString(); 
    this.periodEndTime  = endDate.toISOString();
    console.log("startDate:"+startDate.toISOString());
    console.log("endDate:"+endDate.toISOString());
    this.periodSearch=true;    
    this.refreshCashList();
  }

  refundCash(){
    this.app.getRootNavs()[0].push(CashRefundMainPage);
  }

  chargeCash(){
    this.app.getRootNavs()[0].push(CashChargePage,{class:"CashChargePage"});
  }

  addCard(){
        if(this.storageProvider.tourMode){
            let alert = this.alertController.create({
                title: '둘러보기 모드입니다.',
                buttons: ['OK']
            });
            alert.present()
            return;
    }

    this.cardProvider.addCard();
  }

  removeCard(i){
    let alert = this.alertController.create({
        title: this.storageProvider.payInfo[i].info.name+"를 삭제하시겠습니까?",
              buttons: [
        {
          text: '네',
          handler: () => {
            console.log('Agree clicked');
            this.cardProvider.removeCard(i);
          }
        },
        {
          text: '아니오',
          handler: () => {
            console.log('Disagree clicked');
          }
        }
      ]
    });
    alert.present();
  
  }

  exitTourMode(){
    console.log("exit Tour Mode");
    this.app.getRootNav().pop();
  }
  
  cashTutorial(){
    this.app.getRootNav().push(CashTutorialPage);
  }
 
 cashConfirm(trans){
      let cashConfirmModal= this.modalCtrl.create(CashConfirmPage, { custom: trans });
      cashConfirmModal.present();
 }

 launchToss(){
     this.serverProvider.checkTossExistence().then(()=>{
        this.app.getRootNavs()[0].push(TossTransferPage);
     },err=>{
          let alert = this.alertController.create({
              title: '토스앱을 설치해주세요.',
              buttons: ['OK']
          });
          alert.present();        
     })
 }
  ////////////////////////////////////////////////////////////////
}
