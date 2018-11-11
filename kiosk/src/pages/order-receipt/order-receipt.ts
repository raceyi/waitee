import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController,LoadingController } from 'ionic-angular';
import {HomePage} from '../home/home';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import { Keyboard } from '@ionic-native/keyboard';

declare var window:any;
var gOrderReceiptPage:any;

/**
 * Generated class for the OrderReceiptPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-order-receipt',
  templateUrl: 'order-receipt.html',
})
export class OrderReceiptPage {
  //cardInfo;

  phoneNumber="";
  waiteeNumber="";
  orderNotifyDone:boolean=false;
  notifyMethodWaitee; // 웨이티 번호 

  order;
  timerId;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private alertCtrl:AlertController,
              public serverProvider:ServerProvider,
              public loadingCtrl: LoadingController,
              private keyboard: Keyboard,
              public storageProvider:StorageProvider) {

   // console.log("storageProvider.shop:"+JSON.stringify(storageProvider.shop));
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
                subTitle: '주문이 전달될 휴대폰 번호가 유효하지 않습니다.',
                buttons: ['OK']
              });
              alert.present();
              return;        
      }

      let body={phone:this.phoneNumber.replace(/-/g, ""), orderId:this.order.orderId,english:false};
      let loading = this.loadingCtrl.create({
            content: '주문서를 발송중입니다.'
            });
            loading.present();
      this.serverProvider.post("/kiosk/sendOrderInfoWithPhone",body).then((response:any)=>{
        loading.dismiss();
          if(response.result=="success"){
              this.orderNotifyDone=true;            
              // 웨이티에 번호를 등록하시겠습니까? 주문전달이외의 목적으로 사용되지 않습니다. 
             let alert = this.alertCtrl.create({
                              title: '웨이티에 번호를 등록하시겠습니까?',
                              message: '주문전달이외의 목적으로 사용되지 않습니다.',
                              buttons: [
                                {
                                  text: '아니오',
                                  handler: () => {
                                    console.log('Disagree clicked');
                                  }
                                },
                                {
                                  text: '네',
                                  handler: () => {
                                    console.log('Agree clicked');
                                     let loading = this.loadingCtrl.create({
                                      content: '번호를 등록중입니다.'
                                      });
                                      loading.present();
                                    this.serverProvider.post("/kiosk/registerPhone",body).then((response:any)=>{
                                      loading.dismiss();
                                      console.log('response:'+JSON.stringify(response));
                                      if(response.result=="success"){
                                          let number=response.digitsNumber;
                                          let digits=response.digitsMask;
                                          let alert = this.alertCtrl.create({
                                                title:'고객님의 웨이티 등록번호는 <br>휴대폰 뒷자리 '+number+'개입니다.',
                                                subTitle: digits,
                                                buttons:[
                                                    {
                                                      text: '네',
                                                      handler: () => {
                                                              }
                                                    }]});
                                              alert.present();
                                      }else if(response.error.startsWith("alreadyRegistered")){
                                            let waiteeNumber=response.error.substr("alreadyRegistered:".length);
                                            let alert = this.alertCtrl.create({
                                                title:'이미등록된 번호입니다.',
                                                subTitle: "웨이디 등록번호:"+ waiteeNumber,
                                                buttons: [
                                                    {
                                                      text: '네',
                                                      handler: () => {
                                                              }
                                                    }]});
                                              alert.present();
                                      }else{
                                          let alert = this.alertCtrl.create({
                                                title:'서버와 통신에 실패했습니다.',
                                                subTitle: '다음기회에 등록해주시기 바랍니다.',
                                                buttons: ['OK']
                                              });
                                              alert.present();
                                      }
                                    },err=>{
                                      loading.dismiss();
                                      //console.log("..."+err.startsWith("alreadyRegistered"))
                                        if(err=="NetworkFailure"){
                                          let alert = this.alertCtrl.create({
                                                title:'서버와 통신에 실패했습니다.',
                                                subTitle: '다음기회에 등록해주시기 바랍니다.',
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
                title:'서버와 통신에 실패했습니다.',
                subTitle: '주문 번호를 기억해주세요.',
                buttons: ['OK']
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
            content: '주문서를 발송중입니다.'
            });
            loading.present();      
      this.serverProvider.post("/kiosk/sendOrderInfoWithWaitee",body).then((response:any)=>{
        loading.dismiss();
          if(response.result=="success"){
              // 웨이티에 번호를 등록하시겠습니까? 주문전달이외의 목적으로 사용되지 않습니다. 
              this.orderNotifyDone=true;
          }else if(response.error=="waiteeNumberInvald"){
            let alert = this.alertCtrl.create({
                title:'미등록 번호입니다.',
                subTitle: '등록후 사용해 주시기 바랍니다.',
                buttons: ['OK']
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
                title:'서버와 통신에 실패했습니다.',
                subTitle: '주문 번호를 기억해주세요.',
                buttons: ['OK']
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
