import { Component ,ViewChild,ElementRef} from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController,TextInput,LoadingController} from 'ionic-angular';
import { CartProvider } from '../../providers/cart/cart';
import {CashReceiptPage} from '../cash-receipt/cash-receipt';
import {OrderReceiptPage} from '../order-receipt/order-receipt';
import {CardExplainPage} from '../card-explain/card-explain';
import {ServerProvider} from '../../providers/server/server';
import { WebIntent } from '@ionic-native/web-intent';
import {StorageProvider} from '../../providers/storage/storage';

declare var window:any;
var gOrderListPage;

/**
 * Generated class for the OrderListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-order-list',
  templateUrl: 'order-list.html',
})
export class OrderListPage {
  //takeoutAvailable:boolean=false;   ////// 일부 메뉴 포장시 따로 주문결제를 수행해 주시기 바랍니다. 
  inStoreColor="#FF5F3A";
  takeoutColor="#bdbdbd";
  takeout=0; //매장 
  phoneNumber="";
  orderNotify=true;
  activityInProgress=false;
  paymentTimer;

  @ViewChild("phoneInput") public phoneInput: TextInput;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private alertCtrl:AlertController,
              public loadingCtrl: LoadingController,
              private webIntent: WebIntent,
              public serverProvider:ServerProvider,
              public storageProvider:StorageProvider, 
              public cartProvider:CartProvider) {
    gOrderListPage=this;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderListPage');
  }

  selectInStore(){
      this.inStoreColor="#FF5F3A";
      this.takeoutColor="#bdbdbd";
      this.takeout=0; //takeout:1 , takeout:2(delivery)
  }

  selectTakeOut(){
      this.inStoreColor="#bdbdbd";
      this.takeoutColor="#FF5F3A";
      this.takeout=1; //takeout:1 , takeout:2(delivery)
  }

  back(){
    this.navCtrl.pop();
  }

  configureOrderNotify(){
    console.log("configureOrderNotify:"+this.orderNotify);
    this.orderNotify=!this.orderNotify;
  }

  moveCardPayment(){
    if(!this.checkTimeConstraint()){
            let alert = this.alertCtrl.create({
              title: '주문 불가능 메뉴가 포함되어 있습니다.',
              buttons: ['OK']
            });
            alert.present();
            return;
    }
    if(this.orderNotify){
        console.log("moveCardPayment:"+this.phoneNumber.trim().length);
        if(this.phoneNumber.trim().length==0){
                console.log("focus on phone number");
                this.phoneInput.setFocus(); 
                return;
        }
        if(!this.checkPhoneValidity()){
                let alert = this.alertCtrl.create({
                  title: '주문서가 전달될 휴대폰 번호가 유효하지 않습니다.',
                  buttons: ['OK']
                });
                alert.present();
                return;        
        }
    }
    let body={orderList:this.cartProvider.orderList}
    this.serverProvider.post("/kiosk/checkSoldOut",body).then((res:any)=>{  // check sold-out
        if(res.result=="success" && res.soldout==true){ 
            let alert = this.alertCtrl.create({
              title: '구매 불가능한 포함되어 메뉴가 있습니다.',
              buttons: ['OK']
            });
            alert.present();
            return;  
        }else if(res.result=="success" && res.soldout==false){
              this.makePayment();
        }      
    },err=>{
            let alert = this.alertCtrl.create({
              title: '서버와 통신에 문제가 있습니다..',
              buttons: ['OK']
            });
            alert.present();      
    })
  }

  makePayment(){
    if(this.storageProvider.van=="nice"){
        this.navCtrl.push(CardExplainPage,{class:"CardExplainPage"});
    }else if(this.storageProvider.van=="smartro" && !this.activityInProgress){
        this.activityInProgress=true;
        let loading = this.loadingCtrl.create({
          content: '결제 준비중입니다.'
        });
        loading.present();

        //let tmpVal="smartroapp://freepaylink?mode=normal&amount=50&trantype=card&amount=100&surtax=0&totalamount=100&tranno=0008&businessno=1428800447&catid=9968333001&receiptmode=2&dongletype=5";
        let totalamount=this.cartProvider.totalAmount;
        let surtax=Math.round(totalamount/11);
        let amount=totalamount-surtax;

        this.storageProvider.getTransNo().then(tranno=>{
        //let businessno=this.storageProvider.shop.shopInfo.businessNumber;
        //let catid=this.storageProvider.catid; 
        /*
        let alert = gOrderListPage.alertCtrl.create({
                  title: 'transno:'+tranno,
                  buttons: ['OK']
                });
        alert.present();
        */        
        let businessno="7721300255";
        let catid="7098349001";
        let reqVal="smartroapp://freepaylink?mode=normal&amount="+amount+"&trantype=card&surtax="+surtax+"&totalamount="+totalamount+"&tranno="+tranno +"&businessno="+businessno+"&catid="+catid+"&installment=0&receiptmode=2&dongletype=5";
        console.log("reqVal:"+reqVal);
        // set timer : 3분안에 결제가 끝나지 않으면 종료하고 마지막 결제정보를 저장한다. 사용자가 취소할수 있도록...
        this.storageProvider.setPaymentFailure();
        this.paymentTimer=setTimeout(function(){
          /*  Just reboot.
              //let trantype= "lastquery";
              //catid,businessno,tranno,subtran,autheddate
              this.storageProvider.getTransNo().then(tranno=>{
                  let reqVal="smartroapp://freepaylink?mode=normal&trantype=lastquery&tranno="+tranno +"&businessno="+businessno+"&catid="+catid+"&receiptmode=2&dongletype=5";
                  let today=new Date();
                  let month=(today.getMonth()+1)<10? '0'+(today.getMonth()+1):(today.getMonth()+1);
                  let date=(today.getDate()<10)?'0'+today.getDate():today.getDate();
                  let orderDate=today.getFullYear()+ today.getMonth() +today.getDate();
                  console.log("orderDate:"+orderDate);
                  //save necessary info for lastquery;
              })
           */   
        }, 3*60*1000); //3분    
        //
        this.webIntent.startActivityForResult({ action: this.webIntent.ACTION_VIEW, url: reqVal }).then(function(res:any){ 
          clearTimeout(gOrderListPage.paymentTimer);
          gOrderListPage.storageProvider.clearPaymentFailure();
          gOrderListPage.activityInProgress=false;
          loading.dismiss();
         // let res={"extras":{"resultval":"0","servicetip":"0","amount":"91","cardno":"943116******4576","surtax":"9","tranno":"[object Promise]","resultCode":0,"printmessage":"","shopName":"타킷 주식회>사","totalamount":"100","merchantno":"145852535","serverres":"00","outmessage":"정상승인\u001e30000172","shopAddress":"서울 서초구 강남대로 479  (반포동) B1층 131호 피치트리랩","mode":"normal","catid":"9968333001","approvaldate":"20180825192450","shopOwnerName":"이경주","approvalno":"30000172","acquiercode":"0011","acquiername":"농협중앙회      ","tranuniqe":"900000498433","receipt":"on","requestCode":1,"trantype":"card","issuercode":"0171","issuername":"NH기업체크","dongleInfo":"####SMT-M2410101FC180512701001000000FC01.01.00.10","dongletype":"5","businessno":"1428800447","batteryInfo":"94%","receiptmode":"2","installment":"0"},"flags":0};          
          console.log('★★startActivityForResult '+JSON.stringify(res)); 
          console.log("res.extras:"+res.extras+" res.extras.resultval:"+res.extras.resultval);
          let output=gOrderListPage.serverProvider.smartroResultParser(res);

          if(res.extras && res.extras.resultval=="0"){ 
                let phoneNumber=gOrderListPage.phoneNumber.replace(/-/g, "");
                let output=gOrderListPage.serverProvider.smartroResultParser(res);
                gOrderListPage.serverProvider.saveOrder(gOrderListPage.takeout,
                                                        phoneNumber,
                                                        "card",
                                                        JSON.stringify(res),
                                                        null,
                                                        null,
                                                        null).then((response:any)=>{
                   if(response.result=="success"){   
                          let orderName=gOrderListPage.cartProvider.orderName;                       
                          if(gOrderListPage.cartProvider.orderList.length==1){
                              //Please check below code 
                              orderName=gOrderListPage.cartProvider.orderList[0].menuName+gOrderListPage.cartProvider.orderList[0].quantity+"개";
                          }
                          gOrderListPage.cartProvider.resetCart();
                          gOrderListPage.navCtrl.setRoot(OrderReceiptPage,{class:"OrderReceiptPage",
                                                                            orderNO:response.orderNO, 
                                                                            orderName: orderName,
                                                                            orderNotify:gOrderListPage.orderNotify,
                                                                            phone:gOrderListPage.phoneNumber.trim(), 
                                                                            cardInfo:output});
                   }else{
                        let alert = gOrderListPage.alertCtrl.create({
                          title: '주문 등록에 실패했습니다.',
                          subTitle: "카드 결제를 취소하시기 바랍니다.",
                          buttons:  [
                            {
                              text: 'OK',
                              handler: () => {
                                  gOrderListPage.serverProvider.smartroCancelPayment(amount,output.approvalNO,output.approvalTime).then(()=>{
                                        let alert = gOrderListPage.alertCtrl.create({
                                          title: '카드결제를 취소하였습니다.',
                                          buttons: ['OK']
                                        });
                                        alert.present();
                                  },err=>{
                                        // 주문 내역을 kakaotalk으로 고객에게 전달한다.
                                        // 업주가 취소가능하도록 한다. How?
                                        // save it into storage.
                                        gOrderListPage.storageProvider.saveCancelFailure(output);
                                        let alert = gOrderListPage.alertCtrl.create({
                                          title: '카드결제 취소에 실패하였습니다.',
                                          subTitle:'홈->주문확인에서 주문 시간으로 카드 결제 취소가 가능합니다.',
                                          buttons: ['OK']
                                        });
                                        alert.present();
                                  })
                              }
                            }]
                        });
                        alert.present(); 
                        // 카드 취소하기 
                   }
                })
          }else{
                let alert = gOrderListPage.alertCtrl.create({
                  title: '카드결제에 실패했습니다.',
                  buttons: ['OK']
                });
                alert.present();
          }
        }, function(err){ 
          clearTimeout(gOrderListPage.paymentTimer);
          gOrderListPage.storageProvider.clearPaymentFailure();
          gOrderListPage.activityInProgress=false;
          loading.dismiss();        
            console.log('★★startActivity err'); console.log(err); 
                let alert = gOrderListPage.alertCtrl.create({
                  title: '카드결제에 실패했습니다.',
                  buttons: ['OK']
                });
                alert.present();
          })
        });
    }
  }

  moveCashPayment(){
      if(!this.checkTimeConstraint()){
              let alert = this.alertCtrl.create({
                subTitle: '매진된 메뉴가 포함되어 있습니다.',
                buttons: ['OK']
              });
              alert.present();
              return;
      }
      if(this.phoneNumber.trim().length==0){
              console.log("focus on phone number");
              this.phoneInput.setFocus(); 
              return;
      }      
      if(!this.checkPhoneValidity()){
              let alert = this.alertCtrl.create({
                subTitle: '주문이 전달될 휴대폰 번호가 유효하지 않습니다.',
                buttons: ['OK']
              });
              alert.present();
              return;        
      }
      let confirm = this.alertCtrl.create({
      title: '현금영수증을 발급받으시겠습니까?',
      buttons: [
        {
          text: '아니오',
          handler: () => {
            console.log('Disagree clicked');
            this.navCtrl.push(CashReceiptPage,{class:"CashReceiptPage",receipt:false});            
            return;
          }
        },
        {
          text: '네',
          handler: () => {
            console.log('Aagree clicked');
            this.navCtrl.push(CashReceiptPage,{class:"CashReceiptPage",receipt:true,phone:this.phoneNumber.replace(/-/g, "")});
            return;
          }
        }]
      });
      confirm.present();
  }

  resetCart(){
    this.cartProvider.resetCart();
    this.navCtrl.pop();
  }

  delete(i){
    this.cartProvider.removeMenu(i).then(()=>{
      console.log("cart length:"+this.cartProvider.orderList.length);
      if(this.cartProvider.orderList.length==0){
        this.navCtrl.pop();
      }
    },err=>{

    });
  }

  checkTimeConstraint(){
    // 구현이 필요하다!!!!
    return true;
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

}
