import { Component ,ViewChild,ElementRef} from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController,TextInput,LoadingController} from 'ionic-angular';
import { CartProvider } from '../../providers/cart/cart';
import {CashReceiptPage} from '../cash-receipt/cash-receipt';
import {CardExplainPage} from '../card-explain/card-explain';
import {ServerProvider} from '../../providers/server/server';
import { WebIntent } from '@ionic-native/web-intent';
import {StorageProvider} from '../../providers/storage/storage';
import {EnOrderReceiptPage} from '../en-order-receipt/en-order-receipt';
import {HomePage} from '../home/home';

declare var window:any;
var gOrderListPage;
/**
 * Generated class for the EnOrderListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-en-order-list',
  templateUrl: 'en-order-list.html',
})
export class EnOrderListPage {

  //takeoutAvailable:boolean=false;   ////// 일부 메뉴 포장시 따로 주문결제를 수행해 주시기 바랍니다. 
  inStoreColor="#FF5F3A";
  takeoutColor="#bdbdbd";
  takeout=0; //매장 
  phoneNumber="";
  orderNotify=false; //주문 완료
  activityInProgress=false;
  paymentTimer;

  receiptIssue:number=1; // default로 발급설정
  receiptType ="IncomeDeduction";
  receiptId="";

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
              title: 'Some menus are not available now.',// 현재 시간 주문 불가능 메뉴가 포함되어 있습니다.',
              buttons: ['OK']
            });
            alert.present();
            return;
    }
    let body={orderList:this.cartProvider.orderList}
    this.serverProvider.post("/kiosk/checkSoldOutEn",body).then((res:any)=>{  // check sold-out
        if(res.result=="success" && res.soldout==true){ 
            let alert = this.alertCtrl.create({
              title: 'Some menus are not available.',//구매 불가능한 포함되어 메뉴가 있습니다.',
              buttons: ['OK']
            });
            alert.present();
            return;  
        }else if(res.result=="success" && res.soldout==false){
              this.makePayment();
        }else if(res.result=="failure" && res.error=="invalidOption"){
            let alert = this.alertCtrl.create({
              title: 'Menu information is invalid.',//'메뉴 정보가 서버 정보와 틀립니다. 키오스크를 다시 시작해 주시기 바랍니다.',
              subTitle:'Please restart kiosk application',
              buttons: ['OK']
            });
            alert.present();
            return;
        }      
    },err=>{
            let alert = this.alertCtrl.create({
              title: 'Network has problem',// 서버와 통신에 문제가 있습니다..',
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
          content: 'Payment is in progress ',//결제 준비중입니다.'
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
          //let res={"extras":{"resultval":"0","servicetip":"0","amount":"91","cardno":"943116******4576","surtax":"9","tranno":"[object Promise]","resultCode":0,"printmessage":"","shopName":"타킷 주식회>사","totalamount":"100","merchantno":"145852535","serverres":"00","outmessage":"정상승인\u001e30000172","shopAddress":"서울 서초구 강남대로 479  (반포동) B1층 131호 피치트리랩","mode":"normal","catid":"9968333001","approvaldate":"20180825192450","shopOwnerName":"이경주","approvalno":"30000172","acquiercode":"0011","acquiername":"농협중앙회      ","tranuniqe":"900000498433","receipt":"on","requestCode":1,"trantype":"card","issuercode":"0171","issuername":"NH기업체크","dongleInfo":"####SMT-M2410101FC180512701001000000FC01.01.00.10","dongletype":"5","businessno":"1428800447","batteryInfo":"94%","receiptmode":"2","installment":"0"},"flags":0};          
          console.log('★★startActivityForResult '+JSON.stringify(res)); 
          console.log("res.extras:"+res.extras+" res.extras.resultval:"+res.extras.resultval);
          let output=gOrderListPage.serverProvider.smartroResultParser(res);

          if(res.extras && res.extras.resultval=="0"){ 
                let phoneNumber=gOrderListPage.phoneNumber.replace(/-/g, "");
                let output=gOrderListPage.serverProvider.smartroResultParser(res);
                gOrderListPage.serverProvider.saveOrder(gOrderListPage.takeout,
                                                        "card",
                                                        JSON.stringify(res),true,undefined,undefined,undefined).then((response:any)=>{
                   if(response.result=="success"){   
                        let loadingPage = gOrderListPage.loadingCtrl.create({
                            content: 'Order Number['+ response.order.orderNO+'] Moving into order information page. \n You can check order information Upper Left at Main Page.',
                            duration: 10000
                            });
                            loadingPage.present();                    
                            let timer=setTimeout(function(){
                            gOrderListPage.navCtrl.setRoot(HomePage);
                            let alert = gOrderListPage.alertCtrl.create({
                                    title: 'Sorry. We failed to move into ordr information page',
                                    subTitle: 'Please remember your order number ['+ response.order.orderNO +']',
                                    buttons:  [
                                    {
                                        text: 'OK',
                                        handler: () => {
                                        }
                                    }]
                                });
                                alert.present(); 
                            },10000);

                          let orderName=gOrderListPage.cartProvider.orderName;                       
                          if(gOrderListPage.cartProvider.orderList.length==1){
                              //Please check below code 
                              orderName=gOrderListPage.cartProvider.orderList[0].menuName+gOrderListPage.cartProvider.orderList[0].quantity+"개";
                          }
                          gOrderListPage.cartProvider.resetCart();
                          gOrderListPage.navCtrl.setRoot(EnOrderReceiptPage,{class:"enOrderReceiptPage",order:response.order,loadingCtrl:loadingPage,timer:timer});
                   }else{
                        let alert = gOrderListPage.alertCtrl.create({
                          title: 'Order registration failed.',//주문 등록에 실패했습니다.',
                          subTitle:  'Please cancel your card payment.',//"카드 결제를 취소하시기 바랍니다.",
                          buttons:  [
                            {
                              text: 'OK',
                              handler: () => {
                                  gOrderListPage.serverProvider.smartroCancelPayment(amount,output.approvalNO,output.approvalTime).then((response)=>{
                                        let output=gOrderListPage.serverProvider.smartroResultParser(JSON.parse(response));
                                        let alert = gOrderListPage.alertController.create({
                                            title: 'The card payment is cancelled.',
                                            subTitle:  'Approval NO for cancellation:'+  output.approvalNO,                                      
                                          buttons: ['OK']
                                        });
                                        alert.present();
                                  },err=>{
                                        // 주문 내역을 kakaotalk으로 고객에게 전달한다.
                                        // 업주가 취소가능하도록 한다. How?
                                        // save it into storage.
                                        gOrderListPage.storageProvider.saveCancelFailure(output);
                                        let alert = gOrderListPage.alertCtrl.create({
                                          title: 'Card payment cancellation failed',//카드결제 취소에 실패하였습니다.',
                                          //subTitle:'주문확인에서 주문 시간으로 카드 결제 취소가 가능합니다.',
                                          subTitle:'You can cancel your payment by the order time at ORDER INFO.',
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
                  title: 'Card payment failed',//카드결제에 실패했습니다.',
                  buttons: ['OK']
                });
                alert.present();
          }
      /*  */                
        }, function(err){ 
          clearTimeout(gOrderListPage.paymentTimer);
          gOrderListPage.storageProvider.clearPaymentFailure();
          gOrderListPage.activityInProgress=false;
          loading.dismiss();        
            console.log('★★startActivity err'); console.log(err); 
                let alert = gOrderListPage.alertCtrl.create({
                  title: 'Card payment failed',
                  buttons: ['OK']
                });
                alert.present();
          })
          /*  카드 결제 없는 검증을 위해서는 아래 라인을 comment out한다.  */
        //});       
        /* */      
    });
    }
  }

  moveCashPayment(){
    console.log("moveCashPayment comes");
    if(!this.checkTimeConstraint()){
                let alert = this.alertCtrl.create({
                  title: 'Some menus are not available now.',//'현재 시간 주문 불가능 메뉴가 포함되어 있습니다.',
                  buttons: ['OK']
                });
                alert.present();
                return;
        }
        let body={orderList:this.cartProvider.orderList}
        this.serverProvider.post("/kiosk/checkSoldOutEn",body).then((res:any)=>{  // check sold-out
            console.log("checkSoldoutEn-returns "+JSON.stringify(res));
            if(res.result=="success" && res.soldout==true){ 
                let alert = this.alertCtrl.create({
                  title: 'Some menus are not available.',//'구매 불가능한 포함되어 메뉴가 있습니다.',
                  buttons: ['OK']
                });
                alert.present();
                return;  
            }else if(res.result=="success" && res.soldout==false){
                  // cash일경우 현금 영수증 정보가 추가되어야만 한다.
                  this.serverProvider.saveOrder(this.takeout,"cash",undefined,true,undefined,undefined,undefined).then((response:any)=>{
                              if(response.result=="success"){   
                                    let loadingPage = this.loadingCtrl.create({
                                        content: 'Order Number['+ response.order.orderNO+'] Moving into order information page. \n You can check order information Upper Left at Main Page.',
                                        duration: 10000
                                      });
                                      loadingPage.present();                    
                                      let timer=setTimeout(function(){
                                        gOrderListPage.navCtrl.setRoot(HomePage);
                                        let alert = gOrderListPage.alertCtrl.create({
                                              title: 'Sorry. We failed to move into ordr information page',
                                              subTitle: 'Please remember your order number ['+ response.order.orderNO +']',
                                              buttons:  [
                                                {
                                                  text: 'OK',
                                                  handler: () => {
                                                  }
                                                }]
                                            });
                                            alert.present(); 
                                      },10000);

                                      gOrderListPage.cartProvider.resetCart();
                                      gOrderListPage.navCtrl.setRoot(EnOrderReceiptPage,{class:"enOrderReceiptPage",order:response.order,loadingCtrl:loadingPage,timer:timer});
                              }else{
                                    let alert = gOrderListPage.alertCtrl.create({
                                      title: 'Order registration failed.',//'주문 등록에 실패했습니다.',
                                      buttons: ['OK']
                                    });
                                    alert.present();
                              } 
                    },err=>{
                        if(err=="NetworkFailure"){
                        let alert = this.alertCtrl.create({
                            title: 'Fail to connect server',//'서버와 통신에 실패했습니다.',
                            buttons: ['OK']
                          });
                          alert.present();
                      }else{
                        let alert = this.alertCtrl.create({
                            title: 'Order registration failed.',//'주문 등록에 실패했습니다.',
                            buttons: ['OK']
                          });
                          alert.present();
                      }
                  });
            }else if(res.result=="failure" && res.error=="invalidOption"){
                let alert = this.alertCtrl.create({
                  title: 'Menu information is invalid.',//'메뉴 정보가 서버 정보와 틀립니다. 키오스크를 다시 시작해 주시기 바랍니다.',
                  subTitle:'Please restart kiosk application',
                  buttons: ['OK']
                });
                alert.present();
                return;
            }         
        },err=>{
                let alert = this.alertCtrl.create({
                  title:  'Network has problem',//'서버와 통신에 문제가 있습니다..',
                  buttons: ['OK']
                });
                alert.present();      
        })
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

  checkOneTimeConstraint(timeConstraint){
        var currTime = new Date();
        let currLocalTime=currTime.getMinutes()+ currTime.getHours()*60;
     
        if(timeConstraint){       
                if(timeConstraint.from && (!timeConstraint.to || timeConstraint.to==null)){
                        //current time in seconds is more than or equal to
                        if(currLocalTime<timeConstraint.fromMins)
                            return false;
                }else if((!timeConstraint.from || timeConstraint.from==null) && timeConstraint.to){
                        //current time is less then or equal to
                        console.log("currLocalTime:"+currLocalTime+"timeConstraint.ToMins:"+timeConstraint.toMins);
                        if(currLocalTime>timeConstraint.toMins){
                            return false;                        
                        }
                }else if(timeConstraint.from && timeConstraint.from!=null 
                        && timeConstraint.to!=null && timeConstraint.to){
                    if(timeConstraint.condition=='XOR'){
                        //current time is more than or equal to from OR 
                        //    current time is less than or equal to to
                        if(timeConstraint.fromMins<currLocalTime ||currLocalTime<timeConstraint.toMins)
                            return false;
                    }else if(timeConstraint.condition=='AND'){
                        //    current time is more than or equal to from AND
                        //    current time is less than or equal to to
                         if(timeConstraint.fromMins>currLocalTime ||currLocalTime>timeConstraint.toMins)
                            return false;
                    }
                }
        }        
        return true;
  }

  checkTimeConstraint(){
        var currTime = new Date();
        let currLocalTime=currTime.getMinutes()+ currTime.getHours()*60;
        console.log("currLocalTime:"+currLocalTime);
      for(var i=0;i<this.cartProvider.orderList.length;i++){
          let menu=this.cartProvider.orderList[i];
          if(menu.timeConstraints){
              if(!this.checkOneTimeConstraint(menu.timeConstraints))
                  return false;
          }
      }
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

  configureReceipt(){
    console.log("configureReceipt:"+this.receiptIssue);
    if(this.receiptIssue==0)
      this.receiptIssue=1;
    else
      this.receiptIssue=0;  
  }

}
