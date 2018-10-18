import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController,LoadingController } from 'ionic-angular';
import {HomePage} from '../home/home';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';

declare var window:any;

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
  orderNotify:boolean=true;
  notifyMethodWaitee:boolean=false; // 웨이티 번호 

  order;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
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

  confirm(){
      this.navCtrl.setRoot(HomePage);  
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
              // 웨이티에 번호를 등록하시겠습니까? 주문전달이외의 목적으로 사용되지 않습니다. 
             let alert = this.alertCtrl.create({
                              title: '웨이티에 번호를 등록하시겠습니까?',
                              message: '주문전달이외의 목적으로 사용되지 않습니다.',
                              buttons: [
                                {
                                  text: '아니오',
                                  handler: () => {
                                    console.log('Disagree clicked');
                                    this.navCtrl.setRoot(HomePage);
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
                                                                this.navCtrl.setRoot(HomePage);
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
                                                                this.navCtrl.setRoot(HomePage);
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
                                              this.navCtrl.setRoot(HomePage);                                      
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
                                          this.navCtrl.setRoot(HomePage);
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
      let body={waiteeNumber:this.waiteeNumber,orderId:this.order.orderId}
      let loading = this.loadingCtrl.create({
            content: '주문서를 발송중입니다.'
            });
            loading.present();      
      this.serverProvider.post("/kiosk/sendOrderInfoWithWaitee",body).then((response:any)=>{
        loading.dismiss();
          if(response.result=="success"){
              // 웨이티에 번호를 등록하시겠습니까? 주문전달이외의 목적으로 사용되지 않습니다. 
              this.navCtrl.setRoot(HomePage);                                      
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
    this.navCtrl.setRoot(HomePage);
  }
}
