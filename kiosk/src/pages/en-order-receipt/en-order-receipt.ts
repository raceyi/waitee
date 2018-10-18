import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController,LoadingController,App,ViewController } from 'ionic-angular';
import {HomePage} from '../home/home';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';

declare var window:any;

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

  phoneNumber="";
  waiteeNumber="";
  orderNotify:boolean=true;
  notifyMethodWaitee:boolean=false; // 웨이티 번호 

  order;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private app:App,
              private alertCtrl:AlertController,
              public serverProvider:ServerProvider,
              public loadingCtrl: LoadingController,
              public storageProvider:StorageProvider) {

   // console.log("storageProvider.shop:"+JSON.stringify(storageProvider.shop));
    this.order=this.navParams.get("order");
    console.log("order:"+JSON.stringify(this.order));
/*
    this.cardInfo=this.navParams.get("cardInfo");

    //this.orderNO=3;
    this.cardInfo={"shopName":"타킷 주식회사","address":"서울 서초구 강남대로 479  (반포동) B1층 131호 피치트리랩","approvalTime":"20180825192450","cardNO":"943116******4576","cardName":"NH기업체크","approvalNO":"30000172","amount":"100"};
    this.orderName="바닐라라떼1개";
   // this.phone="";
*/   
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderReceiptPage');
  }

  configureNotifyMethod(){
    console.log("notifyMethodWaitee:"+this.notifyMethodWaitee);
    this.notifyMethodWaitee=!this.notifyMethodWaitee;
  }

 checkPhoneValidity(){
      if(!this.orderNotify)  return true;

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
  }


inputWaiteeNumber(event){
      console.log("event:"+JSON.stringify(event));
      console.log("event:"+event.keyCode);
      if(event.keyCode==13){ //enter key code
          console.log("enter comes. Please hide keyboard by foucus out");
          window.Keyboard.hide();
      }
      let waiteeNumber=this.waiteeNumber.trim();
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
    if(!this.notifyMethodWaitee){
     if(!this.checkPhoneValidity()){
              let alert = this.alertCtrl.create({
                subTitle: 'The phone number is invalid',//주문이 전달될 휴대폰 번호가 유효하지 않습니다.',
                buttons: ['OK']
              });
              alert.present();
              return;        
      }

      let body={phone:this.phoneNumber.replace(/-/g, ""), orderId:this.order.orderId,english:true};
      let loading = this.loadingCtrl.create({
            content: 'Order information is being sent out.'
            });
            loading.present();
      this.serverProvider.post("/kiosk/sendOrderInfoWithPhone",body).then((response:any)=>{
        loading.dismiss();
          if(response.result=="success"){
              // 웨이티에 번호를 등록하시겠습니까? 주문전달이외의 목적으로 사용되지 않습니다. 
             let alert = this.alertCtrl.create({
                              title: 'Do you want to register WAITEE number?',//웨이티에 번호를 등록하시겠습니까?',
                              message: 'It is not used for purposes other than order information delivery.' ,//'주문전달이외의 목적으로 사용되지 않습니다.',
                              buttons: [
                                {
                                  text: 'No',//'아니오',
                                  handler: () => {
                                    console.log('Disagree clicked');
                                    this.moveHome();
                                  }
                                },
                                {
                                  text: 'Yes',//'네',
                                  handler: () => {
                                    console.log('Agree clicked');
                                     let loading = this.loadingCtrl.create({
                                      content:  'WAITEE number is being registered.',//'번호를 등록중입니다.'
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
                                                      text: 'Yes',//'네',
                                                      handler: () => {
                                                                this.moveHome();
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
                                                      text: 'Yes',//'네',
                                                      handler: () => {
                                                                this.moveHome();
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
                                              this.moveHome();
                                      }
                                    },err=>{
                                      loading.dismiss();
                                      //console.log("..."+err.startsWith("alreadyRegistered"))
                                        if(err=="NetworkFailure"){
                                          let alert = this.alertCtrl.create({
                                                title:'The network has problem',
                                                subTitle: 'Please register it later',
                                                buttons: ['OK']
                                              });
                                              alert.present();
                                          }else{
                                            let alert = this.alertCtrl.create({
                                                title:'Fail to register your number',
                                                subTitle: 'Please register it later',
                                                buttons: ['OK']
                                              });
                                              alert.present();
                                          }   
                                          this.moveHome();  
                                    })
                                  }
                                }
                              ]
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
      let body={waiteeNumber:this.waiteeNumber,orderId:this.order.orderId}
      let loading = this.loadingCtrl.create({
            content: 'We are sending order information.'
            });
            loading.present();      
      this.serverProvider.post("/kiosk/sendOrderInfoWithWaitee",body).then((response:any)=>{
        loading.dismiss();
          if(response.result=="success"){
              // 웨이티에 번호를 등록하시겠습니까? 주문전달이외의 목적으로 사용되지 않습니다. 
              this.moveHome();                                   
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
    this.moveHome();
  }

  moveHome(){
    /*
     //remove all other english pages
    let  views:ViewController[]; 
    views=this.navCtrl.getViews();
    this.navCtrl.remove(1,views.length-2);
    this.navCtrl.pop();
    */
    this.app.getActiveNavs()[0].setRoot(HomePage);
  }
}
