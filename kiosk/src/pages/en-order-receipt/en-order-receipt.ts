import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController,LoadingController,App,ViewController } from 'ionic-angular';
import {HomePage} from '../home/home';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import { Keyboard } from '@ionic-native/keyboard';

declare var window:any;
var gOrderReceiptPage:any;

/**
 * Generated class for the EnOrderReceiptPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-en-order-receipt',
  templateUrl: 'en-order-receipt.html',
})
export class EnOrderReceiptPage {

//cardInfo;
/*
  phoneNumber="";
  waiteeNumber="";
  orderNotify:boolean=true;
  notifyMethodWaitee:boolean=false; // 웨이티 번호 

  order;
  timerId;
*/
  phoneNumber="";
  waiteeNumber="";
  orderNotifyDone:boolean=false;
  notifyMethodWaitee; // 웨이티 번호 

  order;
  timerId;
   
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private app:App,
              private alertCtrl:AlertController,
              public serverProvider:ServerProvider,
              public loadingCtrl: LoadingController,
              private keyboard: Keyboard,              
              public storageProvider:StorageProvider) {
    this.order=this.navParams.get("order");
    console.log("order:"+JSON.stringify(this.order));
    gOrderReceiptPage=this;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderReceiptPage');
    console.log("setTimeout");

     let loadingCtrl= this.navParams.get('loadingCtrl');
     loadingCtrl.dismiss();
     let timer = this.navParams.get('timer');
     clearTimeout(timer);
     this.timerId = setTimeout(function(){
      // 3분후면 home으로 이동함. 
      gOrderReceiptPage.goHome();
    },this.storageProvider.resetTimeout*60*1000); //3분 

  }

  configureNotifyMethod(notifyMethodWaitee){
    console.log("notifyMethodWaitee:"+notifyMethodWaitee);
    this.notifyMethodWaitee=notifyMethodWaitee;
      //timer 해제하기 
      clearTimeout(this.timerId);
      //timer 설정하기 
     console.log("setTimeout");      
     this.timerId = setTimeout(function(){
        // 3분후면 home으로 이동함. 
        gOrderReceiptPage.goHome();
      },this.storageProvider.resetTimeout*60*1000); //3분 
  }

 checkPhoneValidity(){
      var phonenum = this.phoneNumber.trim();
      var regPhone = /(01[0|1|6|9|7])[-](\d{3}|\d{4})[-](\d{4}$)/g;
      if(!regPhone.test(phonenum)){
          return false;    
      }
      return true;
  }

  inputPhoneNumber(event){
      console.log("event:"+JSON.stringify(event));
      console.log("event:"+event.keyCode);
      if(event.keyCode==13){ //enter key code
          console.log("enter comes. Please hide keyboard by foucus out");
          window.Keyboard.hide();
      }
      let phoneNumber=this.phoneNumber.trim();
      this.phoneNumber=this.autoHypenPhone(phoneNumber); // look for phone number
      //timer 해제하기 
      clearTimeout(this.timerId);
      //timer 설정하기 
     console.log("setTimeout");      
     this.timerId = setTimeout(function(){
        // 3분후면 home으로 이동함. 
        gOrderReceiptPage.goHome();
      },this.storageProvider.resetTimeout*60*1000); //3분       
  }


inputWaiteeNumber(event){
      console.log("event:"+JSON.stringify(event));
      console.log("event:"+event.keyCode);
      if(event.keyCode==13){ //enter key code
          console.log("enter comes. Please hide keyboard by foucus out");
          window.Keyboard.hide();
      }
      let waiteeNumber=this.waiteeNumber.trim();
      //timer 해제하기 
      clearTimeout(this.timerId);
      //timer 설정하기 
     console.log("setTimeout");      
     this.timerId = setTimeout(function(){
        // 3분후면 home으로 이동함. 
        gOrderReceiptPage.goHome();
      },this.storageProvider.resetTimeout*60*1000); //3분 
}

    autoHypenPhone(str) {
        str = str.replace(/[^0-9]/g, '');
        var tmp = '';
        if (str.length >= 2 && str.startsWith('02')) {
            tmp += str.substr(0, 2);
            tmp += '-';
            if (str.length < 7) {
                tmp += str.substr(2);
            }
            else {
                tmp += str.substr(2, 3);
                tmp += '-';
                tmp += str.substr(5);
            }
            return tmp;
        }
        else if (str.length < 4) {
            return str;
        }
        else if (str.length < 7) {
            tmp += str.substr(0, 3);
            tmp += '-';
            tmp += str.substr(3);
            return tmp;
        }
        else if (str.length < 11) {
            tmp += str.substr(0, 3);
            tmp += '-';
            tmp += str.substr(3, 3);
            tmp += '-';
            tmp += str.substr(6);
            return tmp;
        }
        else {
            tmp += str.substr(0, 3);
            tmp += '-';
            tmp += str.substr(3, 4);
            tmp += '-';
            tmp += str.substr(7);
            return tmp;
        }
    };

  sendReceipt(){
     //timer 해제하기 
      clearTimeout(this.timerId);
      //timer 설정하기 
     console.log("setTimeout");      
     this.timerId = setTimeout(function(){
        // 3분후면 home으로 이동함. 
        gOrderReceiptPage.goHome();
      },this.storageProvider.resetTimeout*60*1000); //3분     
    if(!this.notifyMethodWaitee){
     if(!this.checkPhoneValidity()){
              let alert = this.alertCtrl.create({
                subTitle: 'The phone number is invalid',
                buttons: ['OK']
              });
              alert.present();
              return;        
      }

      let body={phone:this.phoneNumber.replace(/-/g, ""), orderId:this.order.orderId,english:false};
      let loading = this.loadingCtrl.create({
            content: 'We are sending your order information.'
            });
            loading.present();
      this.serverProvider.post("/kiosk/sendOrderInfoWithPhone",body).then((response:any)=>{
        loading.dismiss();
          if(response.result=="success"){
              this.orderNotifyDone=true;            
              // 웨이티에 번호를 등록하시겠습니까? 주문전달이외의 목적으로 사용되지 않습니다. 
             let alert = this.alertCtrl.create({
                              title: 'Do you want to register WAITEE number?',//웨이티에 번호를 등록하시겠습니까?',
                              message: 'It is not used for purposes other than order information delivery.' ,//'주문전달이외의 목적으로 사용되지 않습니다.',
                              buttons: [
                                {
                                  text: 'No',
                                  handler: () => {
                                    console.log('Disagree clicked');
                                  }
                                },
                                {
                                  text: 'Yes',
                                  handler: () => {
                                    console.log('Agree clicked');
                                     let loading = this.loadingCtrl.create({
                                      content: 'WAITEE number is being registered.'
                                      });
                                      loading.present();
                                    this.serverProvider.post("/kiosk/registerPhone",body).then((response:any)=>{
                                      loading.dismiss();
                                      console.log('response:'+JSON.stringify(response));
                                      if(response.result=="success"){
                                          let number=response.digitsNumber;
                                          let digits=response.digitsMask;
                                          let alert = this.alertCtrl.create({
                                                title:'Your WAITEE number is last'+ number +'digits of your phone.',
                                                subTitle: digits,
                                                buttons:[
                                                    {
                                                      text: 'OK',
                                                      handler: () => {
                                                              }
                                                    }]});
                                              alert.present();
                                      }else if(response.error.startsWith("alreadyRegistered")){
                                            let waiteeNumber=response.error.substr("alreadyRegistered:".length);
                                            let alert = this.alertCtrl.create({
                                                title:'Your phone is already registered.',
                                                subTitle: "WAITEE number:"+ waiteeNumber,
                                                buttons: [
                                                    {
                                                      text: 'OK',
                                                      handler: () => {
                                                              }
                                                    }]});
                                              alert.present();
                                      }else{
                                          let alert = this.alertCtrl.create({
                                                title:'Fail to connect the server',//'서버와 통신에 실패했습니다.',
                                                subTitle: 'Please register it later.',
                                                buttons: ['OK']
                                              });
                                              alert.present();
                                      }
                                    },err=>{
                                      loading.dismiss();
                                      //console.log("..."+err.startsWith("alreadyRegistered"))
                                        if(err=="NetworkFailure"){
                                          let alert = this.alertCtrl.create({
                                                title:'Fail to connect the server',//'서버와 통신에 실패했습니다.',
                                                subTitle: 'Please register it later.',
                                                buttons: ['OK']
                                              });
                                              alert.present();
                                          }else{
                                            let alert = this.alertCtrl.create({
                                                title:'웨이티 번호 등록에 실패하였습니다.',
                                                subTitle: '다음기회에 등록해주시기 바랍니다.',
                                                buttons: ['OK']
                                              });
                                              alert.present();
                                          }     
                                    })
                                  }
                                }
                              ]
                            });
                            alert.present();
          }else{
            let alert = this.alertCtrl.create({
                title:'주문정보 전달에 실패했습니다.',
                subTitle: '주문 번호를 기억해주세요.',
                buttons: ['OK']
              });
              alert.present();
          }
      },err=>{
       loading.dismiss(); 
          if(err=="NetworkFailure"){
            let alert = this.alertCtrl.create({
                title:'The network has problem',
                subTitle: 'Please remember your order number.',
                buttons: ['OK']
              });
              alert.present();
          }else{
            let alert = this.alertCtrl.create({
                title:'Fail to deliver order information.',
                subTitle: 'Please remember your order number.',
                buttons: ['OK']
              });
              alert.present();
          }
      });
    }else{  // waitee등록번호로 발송
      if(!this.waiteeNumber || this.waiteeNumber.length<4){
              let alert = this.alertCtrl.create({
                subTitle: '웨이티 번호가 유효하지 않습니다.',
                buttons: ['OK']
              });
              alert.present();        
          return;
      }
      let body={waiteeNumber:this.waiteeNumber,orderId:this.order.orderId}
      let loading = this.loadingCtrl.create({
            content: 'We are sending your order information.'
            });
            loading.present();      
      this.serverProvider.post("/kiosk/sendOrderInfoWithWaitee",body).then((response:any)=>{
        loading.dismiss();
          if(response.result=="success"){
              this.orderNotifyDone=true;
          }else if(response.error=="waiteeNumberInvald"){
            let alert = this.alertCtrl.create({
                title:'WAITEE number is invalid',
                subTitle: 'Please register WAITEE number',
                buttons: ['OK']
              });
              alert.present();
          }else{
            let alert = this.alertCtrl.create({
                title:'Delivery of order information failed.',
                subTitle: 'Please register WAITEE number',
                buttons: ['OK']
              });
              alert.present();
          }
      },err=>{
        loading.dismiss();
          if(err=="NetworkFailure"){
            let alert = this.alertCtrl.create({
                title:'The network has problem.',
                subTitle: 'Please register WAITEE number',
                buttons: ['OK']
              });
              alert.present();
          }else{
            let alert = this.alertCtrl.create({
                title:'Delivery of order information failed.',
                subTitle: 'Please register WAITEE number',
                buttons: ['OK']
              });
              alert.present();
          }
      });
    }
  }

  goHome(){
    clearTimeout(this.timerId);
    this.keyboard.hide();
    this.navCtrl.setRoot(HomePage);
  }

  cancelNotify(){
    console.log("cancelNotify");
    this.notifyMethodWaitee=undefined;
  }
}
