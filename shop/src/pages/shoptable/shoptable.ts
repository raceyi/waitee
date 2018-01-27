import {Component,EventEmitter,NgZone} from '@angular/core';
import {NavController,App,AlertController,Platform,MenuController,IonicApp,ViewController,Events} from 'ionic-angular';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';
import {StorageProvider} from '../../providers/storageProvider';
import {MediaProvider} from '../../providers/mediaProvider';
import {Http,Headers} from '@angular/http';
import {ErrorPage} from '../../pages/error/error';
import {PrinterProvider} from '../../providers/printerProvider';
import {ServerProvider} from '../../providers/serverProvider';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import {CancelConfirmPage} from '../cancel-confirm/cancel-confirm';
import {IosPrinterProvider} from '../../providers/ios-printer';
import { BackgroundMode } from '@ionic-native/background-mode';

declare var cordova:any;

@Component({
  selector:'page-shoptable',
  templateUrl: 'shoptable.html',
})

export class ShopTablePage {
  Option="today";
  startDate;
  endDate;
 // currTime;
  orders=[];
  pushNotification:PushObject;
  infiniteScroll:any=undefined;
  smsInboxPlugin;
  //isAndroid;
  storeColor="gray";
  notiColor="gray";
  printColor="gray";
  printerEmitterSubscription;

  getTodayString(){
    var d = new Date();
    var mm = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1); // getMonth() is zero-based
    var dd  = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
    var dString=d.getFullYear()+'-'+(mm)+'-'+dd;
    return dString;
  }

  constructor(public navController: NavController,private app:App,private storageProvider:StorageProvider,
      private http:Http,private alertController:AlertController,private ngZone:NgZone,private ionicApp: IonicApp,
      private printerProvider:PrinterProvider,private platform:Platform,private menuCtrl: MenuController,
      public viewCtrl: ViewController,private serverProvider:ServerProvider,private push: Push,
      private mediaProvider:MediaProvider,private events:Events,private iosPrinterProvider:IosPrinterProvider) {
    console.log("ShopTablePage constructor");
    //this.isAndroid=this.platform.is("android");
  
    this.registerPushService();
    
    var date=new Date();
    var month=date.getMonth()+1;

    this.startDate=this.getTodayString();
    this.endDate=this.getTodayString();

    console.log("startDate:"+this.startDate);
    console.log("endDate:"+this.endDate);

    this.getOrders(-1);

    console.log("this.storageProvider.myshop.GCMNoti:"+this.storageProvider.myshop.GCMNoti);

    if(this.storageProvider.myshop.GCMNoti=="off"){
      this.notiColor="gray";
    }else if(this.storageProvider.myshop.GCMNoti=="on"){
      this.notiColor="primary";
    }else{
      console.log("unknown GCMNoti");
    }

    if(this.storageProvider.storeOpen==true)
      this.storeColor="primary";
    else 
      this.storeColor="gray";  
    /////////////////////////////////////////////////////////////////
  }

    ionViewDidLoad(){
          this.events.subscribe('invalidVersion',()=>{
            console.log("shoptable page did enter");
            let alert = this.alertController.create({
                      title: '앱버전을 업데이트해주시기 바랍니다.',
                      subTitle: '현재버전에서는 일부 기능이 정상동작하지 않을수 있습니다.',
                      buttons: ['OK']                                
                    });
                    alert.present();
          });
     
          cordova.plugins.backgroundMode.setDefaults({
              title:  '타킷운영자가 실행중입니다',
              ticker: '주문알림 대기',
              text:   '타킷운영자가 실행중입니다'
          });
          
          cordova.plugins.backgroundMode.enable(); //takitShop always runs in background Mode
          //get shopInfo from server
          this.serverProvider.getShopInfoAll(this.storageProvider.myshop.takitId).then((res:any)=>{
              console.log("shopInfo:"+JSON.stringify(res));
              this.storageProvider.shopInfoSet(res.shopInfo);
              this.storageProvider.shop = res;
          });

   if(this.platform.is("android")){
   // register backbutton handler
    let ready = true;
   //refer to https://github.com/driftyco/ionic/issues/6982
    this.platform.registerBackButtonAction(()=>{
               console.log("Back button action called");

            let activePortal = this.ionicApp._loadingPortal.getActive() ||
               this.ionicApp._modalPortal.getActive() ||
               this.ionicApp._toastPortal.getActive() ||
               this.ionicApp._overlayPortal.getActive();

            if (activePortal) {
               ready = false;
               activePortal.dismiss();
               activePortal.onDidDismiss(() => { ready = true; });

               console.log("handled with portal");
               return;
            }

            if (this.menuCtrl.isOpen()) {
               this.menuCtrl.close();

               console.log("closing menu");
               return;
            }

            let view = this.navController.getActive();
            let page = view ? this.navController.getActive().instance : null;

            if (this.app.getRootNav().getActive()==this.viewCtrl){
               console.log("Handling back button on  tabs page");
               //Please check the amIGotNoti and storeOpen with server call
               if(this.storageProvider.amIGotNoti==true && 
                    this.storageProvider.storeOpen==true){
                    this.alertController.create({
                        title: '앱을 종료하시겠습니까?',
                        message: '알림을 받고 계십니다. 상점도 같이 종료합니다.',
                        buttons: [
                          {
                              text: '아니오',
                              handler: () => {

                              }
                          },
                          {
                              text: '네',
                              handler: () => {
                                console.log("call stopEnsureNoti");
                                console.log("cordova.plugins.backgroundMode.disable");
                                cordova.plugins.backgroundMode.disable();
                                this.closeStore().then(()=>{
                                    console.log("closeStore success");
                                    this.platform.exitApp();  
                                },(err)=>{
                                        if(err=="HttpFailure"){
                                          let alert = this.alertController.create({
                                                            title: '서버와 통신에 문제가 있습니다',
                                                            subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                                            buttons: ['OK']
                                                        });
                                          alert.present();
                                        }else{
                                          let alert = this.alertController.create({
                                                            title: '샵을 종료하는데 실패했습니다.',
                                                            subTitle: '고객센터(0505-170-3636)에 문의바랍니다.',
                                                            buttons: ['OK']
                                                        });
                                          alert.present();
                                        }
                                });
                              }
                          }
                        ]
                    }).present();
               }else{
                    this.platform.exitApp();
               }
            }
            else if (this.navController.canGoBack() || view && view.isOverlay) {
               console.log("popping back");
               this.navController.pop();
            }else{
                console.log("What can I do here? which page is shown now? Error or LoginPage");
                this.platform.exitApp();
            }
         }, 100/* high priority rather than login page */);
   }

/*
        if(this.platform.is("android")){
            if(this.smsInboxPlugin==undefined)
                this.smsInboxPlugin = cordova.require('cordova/plugin/smsinboxplugin');
            this.smsInboxPlugin.isSupported((supported)=>{
              console.log("supported :"+supported);
              if(supported){
                  ////////////////////////////////
                  this.smsInboxPlugin.startReception ((msg)=> {
                  console.log("sms "+msg);
                  },(err)=>{
                      console.log("startReception error:"+JSON.stringify(err));
                  });
              }else{
                  console.log("SMS is not supported");
              }
            },(err)=>{
              console.log("isSupported:"+JSON.stringify(err));
            });
        }
*/
        this.events.subscribe('printer:status', (status) => {
                    console.log("printer status:"+status);
                    this.ngZone.run(()=>{
                      if(this.platform.is('android')){
                        if(this.printerProvider.printerStatus=="connected")
                            this.printColor="primary";
                        else  
                            this.printColor="gray";
                      }else if(this.platform.is('ios')){
                        if(this.iosPrinterProvider.printerStatus=="connected")
                            this.printColor="primary";
                        else  
                            this.printColor="gray";
                      }
                        console.log("ngZone=> Printer status into "+this.printColor);
                });
        });        

        let body = JSON.stringify({takitId:this.storageProvider.myshop.takitId});
        this.serverProvider.post("/shop/getShopInfo",body).then((res:any)=>{
          console.log("/shop/getShopInfo "+JSON.stringify(res));
          if(res.result=="success"){
              this.ngZone.run(()=>{
                if(res.shopInfo.business=="on"){
                     this.storeColor="primary";
                     this.storageProvider.storeOpen=true;
                }else{
                    this.storeColor="gray";
                    this.storageProvider.storeOpen=false;
                }
              });
          }else{
              console.log("getShopInfo-HttpFailure... Please check the reason in server side");
              let alert = this.alertController.create({
                                title: '상점의 개점 여부를 알수 없습니다.',
                                subTitle: '상점 정보를 읽어오는데 실패했습니다.',
                                buttons: ['OK']
                            });
              alert.present();
          }
        },(err)=>{
          if(err=="NetworkFailure"){
              console.log("getShopInfo-서버와 통신에 문제가 있습니다");
              let alert = this.alertController.create({
                                title: '서버와 통신에 문제가 있습니다',
                                subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                buttons: ['OK']
                            });
              alert.present();
           }else{
              console.log("getShopInfo-HttpFailure... Please check the reason in server side");
              let alert = this.alertController.create({
                                title: '상점의 개점 여부를 알수 없습니다.',
                                subTitle: '상점 정보를 읽어오는데 실패했습니다.',
                                buttons: ['OK']
                            });
              alert.present();
           }
        })  
    }

    convertOrderInfo(orderInfo){
          var order:any={};
          order=orderInfo;
          console.log("!!!order:"+JSON.stringify(order));
          //var date=new Date(orderInfo.orderedTime);

          //console.log("local ordered time:"+ date.toLocaleString());//date.toLocaleDateString('ko-KR')
          order.statusString=this.getStatusString(order.orderStatus);
          if(order.orderStatus=="completed" || order.orderStatus=="cancelled")
            order.hidden=true;
          else  
            order.hidden=false;

          if(order.hasOwnProperty("review")){
                order.hidden=false;
          }  
          order.orderListObj=JSON.parse(order.orderList);

          console.log("menus:"+ order.orderListObj.menus);
          if( typeof order.orderListObj.menus ==="string")
                order.orderListObj.menus=JSON.parse(order.orderListObj.menus);

          order.userPhoneHref="tel:"+order.userPhone; 
          //console.log("order.orderListObj:"+JSON.stringify(order.orderListObj));
          console.log("cancelReason:"+order.cancelReason);
          if(order.cancelReason!=undefined &&
                order.cancelReason!=null &&
                order.cancelReason!="")
            order.cancelReasonString=order.cancelReason;
          else
            order.cancelReasonString=undefined;

          return order;
    }

     getOrders(lastOrderId){
      return new Promise((resolve,reject)=>{
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        console.log("getOrders-server:"+ this.storageProvider.serverAddress);
        let body;
        if(this.Option!="period"){
              body  = JSON.stringify({  option: this.Option,
                                        takitId:this.storageProvider.myshop.takitId,
                                        lastOrderId:lastOrderId, 
                                        limit:this.storageProvider.OrdersInPage});
        }else{
              console.log("this.startDate:"+this.startDate);

              var startDate=new Date(this.startDate);
              var endDate= new Date(this.endDate);

              body  = JSON.stringify({  option: this.Option,
                                        takitId:this.storageProvider.myshop.takitId,
                                        lastOrderId:lastOrderId, 
                                        limit:this.storageProvider.OrdersInPage,
                                        startTime:startDate.toISOString(), 
                                         endTime:endDate.toISOString()
                                      });
        }
         console.log("body:"+JSON.stringify(body));
         this.serverProvider.post("/shop/getOrders",body).then((res:any)=>{  
            console.log("!!!getOrders-res:"+JSON.stringify(res));
            var result:string=res.result;
            if(result==="success" &&Array.isArray(res.orders)){
              console.log("res.length:"+res.orders.length);
              res.orders.forEach(order=>{
                  this.orders.push(this.convertOrderInfo(order));
                  console.log("orders:"+JSON.stringify(this.orders));
              });
              resolve(true);
            }else if(res.orders=="0" || result==="failure"){ //Please check if it works or not
              console.log("no more orders");
              resolve(false);
            }
         },(err)=>{
           if(err=="NetworkFailure"){
              console.log("서버와 통신에 문제가 있습니다");
              let alert = this.alertController.create({
                                title: '서버와 통신에 문제가 있습니다',
                                subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                buttons: ['OK']
                            });
              alert.present();
           }else if(err=="HttpFailure"){
              console.log("getOrders-HttpFailure... Please check the reason in server side");
           }
           reject();
         });
      });
     }


    getStatusString(orderStatus){  // next status for label
      console.log("orderStatus:"+orderStatus);
      if(orderStatus=="paid"){
            return "접수";
      }else if(orderStatus=="cancelled"){
            return "취소";
      }else if(orderStatus=="checked"){
            return "준비";
      }else if(orderStatus=="completed"){
            return "전달";
      }else if(orderStatus=="pickup"){
            return "종료"
      }else{
        console.log("invalid orderStatus:"+orderStatus);
        return "미정";
      }
    }


  changeValue(option){
    console.log("changeValue:"+option);
    this.orders=[];
    if(this.infiniteScroll!=undefined)
        this.infiniteScroll.enable(true);

    if(option!="period"){
        this.getOrders(-1);
    }else{
        // user select search button
    }
  }

  startPicker(startDate){
    console.log("startDate:"+startDate);
  }

  endPicker(endDate){
    console.log("endDate:"+endDate);
  }

  searchPeriod(){
    if(this.startDate==undefined || this.endDate==undefined){
      // 시작일과 종료일을 설정해 주시기 바랍니다. 
      let alert = this.alertController.create({
                    title: '시작일과 종료일을 설정해 주시기 바랍니다',
                    buttons: ['OK']
                });
                alert.present();
      return;
    }
    //check the validity of startDate and endDate
    var startDate=new Date(this.startDate);
    var endDate=new Date(this.endDate);
    var currDate=new Date(); 
    console.log(startDate.getTime());
    console.log(endDate.getTime());
    if(startDate.getTime()>endDate.getTime()){
         // 시작일은 종료일보다 늦을수 없습니다.  
          let alert = this.alertController.create({
              title: '시작일은 종료일보다 늦을수 없습니다',
              buttons: ['OK']
          });
          alert.present();
         return;
    }
    if(endDate.getTime()>currDate.getTime()){
         // 시작일은 종료일보다 늦을수 없습니다.  
          let alert = this.alertController.create({
              title: '종료일은 현재시점보다 늦을수 없습니다.',
              buttons: ['OK']
          });
          alert.present();
         return;
         // 종료일은 현재시점보다 늦을수 없습니다.
    }
    // send getOrders request and update orders
    this.orders=[];
    this.getOrders(-1);
  }

  toggleOrder(order){
    console.log("toggleOrder");
    if(order.orderStatus=="paid" ||  order.orderStatus=="checked")
      order.hidden=false;
    else
      order.hidden=(!order.hidden);
  }

    confirmMsgDelivery(messageId){
        return new Promise((resolve,reject)=>{
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            console.log("messageId:"+messageId);
            console.log("!!!server:"+ this.storageProvider.serverAddress);
            let body = JSON.stringify({messageId:messageId});

             this.serverProvider.post("/shop/successGCM",body).then((res:any)=>{   
                resolve();
            },(err)=>{
                reject("err");  
            });
      });   
    }
    
    printCancel(order){
      if(this.storageProvider.printOn==false)
        return;
      var title,message="";
      if(order.orderStatus=="cancelled"){
        if(this.platform.is('android')){
            title="**주문취소["+order.orderNO+"]";
        }else{
            title="**CANCEL["+order.orderNO+"]";
        }
        order.orderListObj.menus.forEach((menu)=>{
            message+="-------------\n";
            message+=" "+menu.menuName+"("+menu.quantity+")\n"; 
            menu.options.forEach((option)=>{
              message+=" "+option.name;
              if(option.select!=undefined){
                  message+="("+option.select+")";
              }
              message+="\n";
            });
        });
      }
      if(this.platform.is('android')){
            this.printerProvider.print(title,message).then(()=>{
                  console.log("print successfully");
            },(err)=>{
                  if(err=="printerUndefined"){
                    let alert = this.alertController.create({
                        title: '앱에서 프린터 설정을 수행해 주시기 바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
                  }else{
                    let alert = this.alertController.create({
                        title: '주문출력에 실패했습니다.',
                        subTitle: '프린터상태를 확인해주시기바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
                  }
            });
      }else if(this.platform.is('ios')){
            this.iosPrinterProvider.print(title,message).then(()=>{
                  console.log("print successfully");
            },(err)=>{
                  if(err=="printerUndefined"){
                    let alert = this.alertController.create({
                        title: '앱에서 프린터 설정을 수행해 주시기 바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
                  }else{
                    let alert = this.alertController.create({
                        title: '주문출력에 실패했습니다.',
                        subTitle: '프린터상태를 확인해주시기바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
                  }
            });
      }
    }

    printOrder(order){
      if(this.storageProvider.printOn==false)
        return;
      
      var title,message="";
      console.log("order:"+JSON.stringify(order));
      if(order.orderStatus=="paid" ||order.orderStatus=="checked"){
          if(this.platform.is('android')){
              title="타킷주문["+order.orderNO+"]";
              if(order.takeout=='1')          
                title+="포장";
              else if(order.takeout=='2'){
                title+="배달"; 
                message=order.deliveryAddress+"\n";
              }
          }else if(this.platform.is('ios')){
              title="ORDER["+order.orderNO+"]";
              if(order.takeout=='1')          
                title+="Takeout";
              else if(order.takeout=='2'){
                title+="Delivery"; 
                message=order.deliveryAddress+"\n";
              }
          }
          order.orderListObj.menus.forEach((menu)=>{
              message+="-------------\n";
              message+=" "+menu.menuName+"("+menu.quantity+")\n"; 
              menu.options.forEach((option)=>{
                message+=" "+option.name;
                if(option.select!=undefined){
                  message+="("+option.select+")";
                }
                message+="\n";
              });
          });
          if(order.userMSG){
              message+="-------------\n";
              message+=order.userMSG;
              message+="\n";
          }
      }else if(order.orderStatus=="completed"){ //print receipt
          if(this.platform.is("android")){
              title="        영수증\n";
          }else if(this.platform.is("ios")){
              title="        Receipt\n";
          }
          message+="상   호:"+this.storageProvider.currentShopname()+"\n";
          message+="사업자번호:"+this.storageProvider.shopInfo.businessNumber+"\n";
          message+="주   소:"+this.storageProvider.shopInfo.address+"\n";
          message+="전화번호:"+ this.storageProvider.shopInfo.shopPhone;
          message+="\n";
          message+=order.localOrderedTime;
          message+="\n";
          order.orderListObj.menus.forEach((menu)=>{
              message+="-------------\n";
              message+=" "+menu.menuName+"("+menu.quantity+")\n"; 
              menu.options.forEach((option)=>{
                message+=" "+option.name;
                if(option.select!=undefined){
                  message+="("+option.select+")";
                }
                message+=menu.quantity*option.price+"\n";
              });
              message+=" "+menu.amount;
          });          
          message+="\n";
          let totalAmount=order.amount;
          let tax=Math.round(totalAmount/11.0);
          let amount=totalAmount-tax;
          message+="판매금액  "+amount +"원";
          message+="부가가치세  "+tax +"원";
          message+="합계     "+totalAmount+"원";
      }else if(order.orderStatus=="cancelled" && order.cancelReason!='고객주문취소'){ //print refund receipt
          if(this.platform.is("android")){
              title="        영수증\n";
          }else if(this.platform.is("ios")){
              title="        Receipt\n";
          }        
          message+="상   호:"+this.storageProvider.currentShopname()+"\n";
          message+="사업자번호:"+this.storageProvider.shopInfo.businessNumber+"\n";
          message+="주   소:"+this.storageProvider.shopInfo.address;
          message+="전화번호:"+ this.storageProvider.shopInfo.shopPhone;
          message+="\n";
          message+=order.localCancelledTime;
          message+="\n";
          order.orderListObj.menus.forEach((menu)=>{
              message+="-------------\n";
              message+=" "+menu.menuName+"(-"+menu.quantity+")\n"; 
              menu.options.forEach((option)=>{
                message+=" "+option.name;
                if(option.select!=undefined){
                  message+="("+option.select+")";
                }
                message+="\n";
              });
          });          
          message+="\n";
          let totalAmount=order.amount;
          let tax=Math.round(totalAmount/11.0);
          let amount=totalAmount-tax;
          message+="판매금액  -"+amount +"원";
          message+="부가가치세  -"+tax +"원";
          message+="합계     -"+totalAmount+"원";          
      }
      if(this.platform.is('android')){
            this.printerProvider.print(title,message).then(()=>{
                  console.log("print successfully");
            },(err)=>{
                  if(err=="printerUndefined"){
                    let alert = this.alertController.create({
                        title: '앱에서 프린터 설정을 수행해 주시기 바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
                  }else{
                    let alert = this.alertController.create({
                        title: '주문출력에 실패했습니다.',
                        subTitle: '프린터상태를 확인해주시기바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
                  }
            });
      }else if(this.platform.is('ios')){
            this.iosPrinterProvider.print(title,message).then(()=>{
                  console.log("print successfully");
            },(err)=>{
                  if(err=="printerUndefined"){
                    let alert = this.alertController.create({
                        title: '앱에서 프린터 설정을 수행해 주시기 바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
                  }else{
                    let alert = this.alertController.create({
                        title: '주문출력에 실패했습니다.',
                        subTitle: '프린터상태를 확인해주시기바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
                  }
            });
      }
    }

      hasItToday(){
        var endDate= new Date(this.endDate);
        var currDate=new Date(); 
        if(endDate.getFullYear()===currDate.getFullYear() 
          && endDate.getMonth()===currDate.getMonth()
          && endDate.getDate()===currDate.getDate()){
            return true;
        }else
            return false;
      }

      paidOrdersExist(){
        console.log("paidOrdersExist");
        if(this.orders.length>0){
             for(var i=0;i<this.orders.length;i++){
                  console.log("order:"+JSON.stringify(this.orders[i]));
                  if(this.orders[i].orderStatus=='paid'){
                    console.log('paidOrdersExist return true;');
                    return true;
                  }
             }
             console.log('paidOrdersExist return false;');
             return false;
        }
      }

      registerPushService(){ // Please move this code into tabs.ts
            this.pushNotification=this.push.init({
                android: {
                    //forceShow: true, // Is it necessary?vibration
                    senderID: this.storageProvider.userSenderID,
                    "sound":true                
                },ios: {
                    //"gcmSandbox": "true", //development mode
                    "fcmSandbox": "false",//production mode
                    "alert": "true",
                    "badge": "true",
                    "sound": "true"
                },
                windows: {}
            });
                        
             this.pushNotification.on('registration').subscribe((response:any)=>{
              console.log("registration..."+response.registrationId);
              var platform;
              if(this.platform.is("android")){
                  platform="android";
              }else if(this.platform.is("ios")){
                  platform="ios";
              }else{
                  platform="unknown";
              }
              let body = JSON.stringify({registrationId:response.registrationId,takitId:this.storageProvider.myshop.takitId,platform:platform});
              console.log("server:"+ this.storageProvider.serverAddress+" body:"+JSON.stringify(body));
              this.serverProvider.post("/shop/registrationId",body).then((res:any)=>{    
                  console.log("registrationId sent successfully");
             },(err)=>{
                  console.log("registrationId sent failure "+JSON.stringify(err));
                  if(err=="NetworkFailure"){
                      //this.storageProvider.errorReasonSet('네트웍 연결이 원할하지 않습니다'); 
                      //Please move into ErrorPage!
                      this.app.getRootNav().setRoot(ErrorPage);
                  }else if(err=="HttpFailure"){
                      console.log("hum... /shop/registrationId-HttpFailure");
                  } 
                });
            });

            this.pushNotification.on('notification').subscribe((data:any)=>{
              console.log("!!! shoporder-data:"+JSON.stringify(data));
              console.log("!!! shoporder-data.custom:"+JSON.stringify(data.additionalData.custom));
              
                if(this.Option!="period" ||(this.Option=="period" && this.hasItToday() )){
                     //Please check if order is new or existing one and then add it or modify it into orders.
                    var additionalData:any=data.additionalData;
                    var playback=false;
                    console.log("!!! additionalData.GCMType:"+additionalData.GCMType);
                    if(additionalData.GCMType==="order"){
                      console.log("order is comming "+data.additionalData.custom);
                       this.ngZone.run(()=>{
                        var incommingOrder; 
                        //Please look for the reason why the format of custom fields are different.
                        if(typeof data.additionalData.custom === 'string')
                            incommingOrder=JSON.parse(data.additionalData.custom);
                        else
                            incommingOrder=data.additionalData.custom;
                        //Please check takitId 
                        if(incommingOrder.takitId!=this.storageProvider.shopInfo.takitId){ // ignore it. hum...or give an alert about it. 
                            let alert = this.alertController.create({
                                title: incommingOrder.takitId+"의 주문이 전달되었습니다.",
                                subTitle: "해당 샵으로 전환하여 주문을 확인해 주시기 바랍니다.",
                                buttons: ['OK']
                            });

                            return;
                        }

                        console.log("incommingOrder:"+ incommingOrder);
                        console.log("incomingOrder.orderStatus:"+ incommingOrder.orderStatus);
                        var i=0;
                        for(;i<this.orders.length;i++){
                                console.log(this.orders[i].orderId+incommingOrder.orderId);
                                if(this.orders[i].orderId == incommingOrder.orderId)
                                      break;
                        }
                        if(i==this.orders.length){
                            var newOrder=this.convertOrderInfo(incommingOrder);
                            this.orders.unshift(newOrder);
                            if(newOrder.orderStatus=="paid"){
                                  this.printOrder(newOrder);
                                  playback=true;
                            }
                        }else{
                           this.orders[i]=this.convertOrderInfo(incommingOrder);   
                           if(this.orders[i].orderStatus=="cancelled"){
                                  this.printCancel(this.orders[i]);
                                  if(!this.paidOrdersExist()){
                                      this.mediaProvider.stop();
                                      playback=false;
                                  }
                           }
                        }
                        console.log("orders update:"+JSON.stringify(this.orders));
                       });
                    }else if(additionalData.GCMType==="change_manager"){
                     //I am not manager anymore. 
                     console.log("I am not a manager any more");
                     this.ngZone.run(()=>{
                        var customInfo; 
                        //Please look for the reason why the format of custom fields are different.
                        if(typeof data.additionalData.custom === 'string')
                            customInfo=JSON.parse(data.additionalData.custom);
                        else
                            customInfo=data.additionalData.custom;
                        console.log("customInfo:"+ customInfo);
                        console.log("customInfo.email:"+ customInfo.email);
                       if(customInfo.email!=this.storageProvider.email){
                          this.notiColor="gray";
                          this.storageProvider.myshop.GCMNoti=="off";
                       }
                     });
                    }

                if(playback){
                    this.mediaProvider.play(); //Please playback after confirmMsg delivered. Playing sound causes error of confirmMsgDelivery due to unknown reasons.
                }
                this.confirmMsgDelivery(additionalData.notId).then(()=>{
                      console.log("confirmMsgDelivery success");
                },(err)=>{
                  if(err=="NetworkFailure"){
                    let alert = this.alertController.create({
                        title: "서버와 통신에 문제가 있습니다.",
                        buttons: ['OK']
                    });
                    alert.present();
                  }else if(err=="HttpFailure"){
                      console.log("confirmMsgDelivery - httpError ");
                  }
                });

                console.log("[shoptable.ts]pushNotification.on-data:"+JSON.stringify(data));
                //console.log("first view name:"+this.navController.first().name);
                //console.log("active view name:"+this.navController.getActive().name);
                //console.log("active view name:"+this.navController.last().name);
               
                console.log(data.message);
                console.log(data.title);
                //console.log(data.count);
                console.log(data.sound);
                //console.log(data.image);
                console.log(data.additionalData);
                
                }
            });

             this.pushNotification.on('error').subscribe((e:any)=>{
                console.log(e.message);
            });
    }

    updateOrder(order){
        if(this.storageProvider.tourMode){
              let alert = this.alertController.create({
                          title: '주문을 처리합니다.',
                          subTitle:'둘러보기 모드에서는 동작하지 않습니다.',
                          buttons: ['OK']
                      });
              alert.present();
          return;
        }
        this.mediaProvider.stop();
        if(order.orderStatus=="paid"){
               this.updateStatus(order,"checkOrder").then(()=>{
                 order.orderStatus="checked";
                 order.statusString="준비"; 
                 order.checkedTime=new Date().toISOString();
               },()=>{
                 console.log("주문 접수에 실패했습니다.");
                 //give Alert here
                 let alert = this.alertController.create({
                                title: '주문 접수에 실패했습니다.',
                                buttons: ['OK']
                            });
                  alert.present();
               });
        }else if(order.orderStatus=="checked"){
            let confirm = this.alertController.create({
                title: '고객님께 준비완료 메시지를 전달할까요?',
                buttons: [{
                            text: '아니오',
                            handler: () => {
                              console.log('Disagree clicked');
                            }
                          },
                          {
                            text: '네',
                            handler: () => {
                                this.updateStatus(order,"completeOrder").then(()=>{
                                  order.orderStatus="completed";
                                  order.statusString="전달"; 
                                  order.completedTime=new Date().toISOString();
                                  //order.hidden=true;
                                },()=>{
                                  console.log("주문 완료에 실패했습니다.");
                                  let alert = this.alertController.create({
                                                  title: '주문 완료에 실패했습니다.',
                                                  buttons: ['OK']
                                              });
                                    alert.present();
                                });;
                            }
                      }]});
              confirm.present();        
        }else if(order.orderStatus=="completed"){
            let confirm = this.alertController.create({
                title: '고객님께 음식료가 전달되었나요?',
                buttons: [{
                            text: '아니오',
                            handler: () => {
                              console.log('Disagree clicked');
                            }
                          },
                          {
                            text: '네',
                            handler: () => {
                                this.updateStatus(order,"pickupOrder").then(()=>{
                                  order.orderStatus="pickup";
                                  order.statusString="종료"; 
                                  order.completedTime=new Date().toISOString();
                                  order.hidden=true;
                                },()=>{
                                  console.log("주문 완료에 실패했습니다.");
                                  let alert = this.alertController.create({
                                                  title: '주문 완료에 실패했습니다.',
                                                  buttons: ['OK']
                                              });
                                    alert.present();
                                });;
                            }
                      }]});
              confirm.present();        
        }
    }

    cancelOrder(order,cancelReason:string){
      this.mediaProvider.stop();
      return new Promise((resolve,reject)=>{
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let body= JSON.stringify({ orderId: order.orderId,cancelReason:cancelReason});

        console.log("body:"+JSON.stringify(body));
        this.serverProvider.post("/shop/cancelOrderWithEmail",body).then((res:any)=>{ 
            console.log("res:"+JSON.stringify(res));
            if(res.result=="success"){
                 order.orderStatus="cancelled";
                 order.statusString="취소"; 
                 order.cancelReasonString=cancelReason;
                 order.cancelledTime=new Date().toISOString();
                 order.localCancelledTime=new Date().toString(); // Temporary code. Please set this value with the response value of server.
                 order.hidden=true;
                resolve();
            }else{
                reject();
            }
         },(err)=>{
           if(err=="NetworkFailure"){
              console.log("서버와 통신에 문제가 있습니다");
              let alert = this.alertController.create({
                                    title: '서버와 통신에 문제가 있습니다',
                                    subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                    buttons: ['OK']
                                });
              alert.present();
           }else if(err=="HttpFailure"){
              console.log("shop/cancelOrder-HttpFailure");
           }
         });
      });
    }

  myCallbackFunction = (order, reason) => {
        return new Promise((resolve, reject) => {
            console.log("cancelReason:"+reason);
            this.cancelOrder(order,reason).then((result)=>{
                 console.log("cancel-order result:"+result);
                 resolve();
            },(err)=>{
                 console.log("cancel-order err:"+err);
                 reject();
            });
        });
    }

    cancel(order){
      if(this.storageProvider.tourMode){
            let alert = this.alertController.create({
                        title: '주문을 취소합니다.',
                        subTitle:'둘러보기 모드에서는 동작하지 않습니다.',
                        buttons: ['OK']
                    });
            alert.present();
        return;
      }
      console.log("order cancel comes");
      this.navController.push(CancelConfirmPage,{order:order, callback:this.myCallbackFunction});
    }

    updateStatus(order,request){
      return new Promise((resolve,reject)=>{
        let body= JSON.stringify({ orderId: order.orderId });

        console.log("body:"+JSON.stringify(body));
        this.serverProvider.post("/shop/"+request+"WithEmail",body).then((res:any)=>{   
            console.log(request+"-res:"+JSON.stringify(res));
            if(res.result=="success"){
                resolve("주문상태변경에 성공했습니다");
            }else{
                resolve("주문상태변경에 실패했습니다");
                let alert = this.alertController.create({
                                title: '주문상태변경에 실패했습니다',
                                buttons: ['OK']
                            });
                alert.present();
            }
         },(err)=>{
           if(err=="NetworkFailure"){
              console.log("서버와 통신에 문제가 있습니다");
              reject("서버와 통신에 문제가 있습니다");
              let alert = this.alertController.create({
                                    title: '서버와 통신에 문제가 있습니다',
                                    subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                    buttons: ['OK']
                                });
                alert.present();
           }else if(err=="HttpFailure"){
              console.log("shop/"+request+"-HttpFailure");
           }
         });
      });
     }

     doInfinite(infiniteScroll){
        var lastOrderId=this.orders[this.orders.length-1].orderId;
        this.getOrders(lastOrderId).then((more)=>{
          if(more)
              infiniteScroll.complete();
          else{
              infiniteScroll.enable(false); //stop infinite scroll
              this.infiniteScroll=infiniteScroll;
          }
        });
     }

     getOrderColor(order){
       if(order.orderStatus==='completed'){
          return 'gray';
       }else{
         return 'primary';
       }
     }

  getGMTtimeInMilliseconds(time:string){
      let year=parseInt(time.substr(0,4));
      let month=parseInt(time.substr(5,2))-1;
      let day=parseInt(time.substr(8,2));
      let hours=parseInt(time.substr(11,2));
      let minutes=parseInt(time.substr(15,2));
      let seconds=parseInt(time.substr(17,2));
      
      var d=Date.UTC(year, month, day, hours, minutes, seconds);
      return d;
  }

  AfterOnedayComplete(order){
    if(order.completedTime!=undefined){
      console.log("completedTime:"+order.completedTime);
      let completedTime:string=order.completedTime;
      let d=this.getGMTtimeInMilliseconds(completedTime);

      let now=new Date();
      //console.log("now: "+now.getTime());
      //console.log("completedTimeLimit: "+(d+ 24*60*60*1000));
      if(now.getTime()>(d+ 24*60*60*1000)){
            console.log("orderNo:"+order.orderNO +" hide is true ");
            return true;
      }
    }     
    return false;
  }
  AfterOnedayCompleteCancel(order){
    if(order.orderStatus=="paid" ||  order.orderStatus=="checked"){
        return false;
    }else if(order.cancelledTime!=undefined && order.cancelledTime!=null){
        //console.log("[AfterOnedayCompleteCancel]cancelledTime:"+order.cancelledTime);
        let cancelledTime:string=order.cancelledTime;
        let d=this.getGMTtimeInMilliseconds(cancelledTime);
        let now=new Date();
        if(now.getTime()<(d+24*60*60*1000)){
            return false;
        }
    }else if(order.completedTime!=undefined && order.completedTime!=null){
        let completedTime:string=order.completedTime;
        let d=this.getGMTtimeInMilliseconds(completedTime);
        let now=new Date();
        if(now.getTime()<(d+24*60*60*1000)){
            return false;
        }
    } 
    return true;  
  }

/*
  AfterOnedayComplete(order){
    if(order.completedTime!=undefined){
        let completedTime=new Date(order.completedTime+" GMT");
        let now=new Date();
        console.log("now:"+now.getTime());
        console.log(" completedTime:"+(completedTime.getTime()+ 24*60*60*1000));
        if(now.getTime()>(completedTime.getTime()+24*60*60*1000)){
            console.log("orderNo:"+order.orderNO +" hide is true ");
            return true;
        }
    }
    //console.log("order hide is false");
    return false;  
  }

  AfterOnedayCompleteCancel(order){
    if(order.orderStatus=="paid" ||  order.orderStatus=="checked"){
        return false;
    }else if(order.cancelledTime!=undefined && order.cancelledTime!=null){
        //console.log("[AfterOnedayCompleteCancel]cancelledTime:"+order.cancelledTime);
        let cancelledTime=new Date(order.cancelledTime+" GMT");
        let now=new Date();
        if(now.getTime()<(cancelledTime.getTime()+24*60*60*1000)){
            return false;
        }
    }else if(order.completedTime!=undefined && order.completedTime!=null){
        let completedTime=new Date(order.completedTime+" GMT");
        let now=new Date();
        if(now.getTime()<(completedTime.getTime()+24*60*60*1000)){
            return false;
        }
    } 
    return true;  
  }
*/
  update(){
    this.orders=[];
    if(this.infiniteScroll!=undefined)
        this.infiniteScroll.enable(true);
    this.getOrders(-1);
    let body= JSON.stringify({ takitId: this.storageProvider.myshop.takitId});
    this.serverProvider.post("/shop/refreshInfo",body).then((res:any)=>{
        console.log("res:"+JSON.stringify(res));
        if(res.result=="success"){
          this.ngZone.run(()=>{
            if(res.shopUserInfo.GCMNoti=="on"){
                this.notiColor="primary";
                this.storageProvider.amIGotNoti=true;
            }else{ // This should be "off"
                this.notiColor="gray";
                this.storageProvider.amIGotNoti=false;
            }
            if(res.shopInfo.business=="on"){
                this.storeColor="primary";
                this.storageProvider.storeOpen=true;
            }else{ // This should be "off"
                this.storeColor="gray";
                this.storageProvider.storeOpen=false;
            }
          });
        }else{
            console.log("/shop/refreshInfo-failure ");
        }
    },(err)=>{
      if(err=="NetworkFailure"){
              let alert = this.alertController.create({
                                title: '서버와 통신에 문제가 있습니다',
                                subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                buttons: ['OK']
                            });
              alert.present();
      }
    });
    
  }

  configureGotNoti(){
    console.log("click configureGotNoti");
    if(this.storageProvider.tourMode){
          let alert = this.alertController.create({
                      title: '주문을 처리하는 담당자가 됩니다.',
                      subTitle:'둘러보기 모드에서는 동작하지 않습니다.',
                      buttons: ['OK']
                  });
          alert.present();
      return;
    }

      let body = JSON.stringify({takitId:this.storageProvider.myshop.takitId});      
       console.log("body: "+body);
      this.serverProvider.post("/shop/refreshInfo",body).then((res:any)=>{
           console.log("refreshInfo res:"+JSON.stringify(res));
          if(res.result=="success"){
             if(res.shopUserInfo.GCMNoti=="on"){
                this.notiColor="primary";
                this.storageProvider.amIGotNoti=true;
            }else{ // This should be "off"
                this.notiColor="gray";
                this.storageProvider.amIGotNoti=false;
            }
            if(res.shopInfo.business=="on"){
                this.storeColor="primary";
                this.storageProvider.storeOpen=true;
            }else{ // This should be "off"
                this.storeColor="gray";
                this.storageProvider.storeOpen=false;
            }
            this.enableGotNoti();
          }
      },(err)=>{
            if(err=="NetworkFailure"){
              let alert = this.alertController.create({
                                title: '서버와 통신에 문제가 있습니다',
                                subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                buttons: ['OK']
                            });
              alert.present();
            }
      });
  }

  enableGotNoti(){
    console.log("enableGotNoti"+ this.storageProvider.amIGotNoti);
    if(this.storageProvider.amIGotNoti==false){
          let confirm = this.alertController.create({
            title: '주문알림을 받으시겠습니까?',
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
                  this.requestManager().then(()=>{
                        this.notiColor="primary";
                        this.storageProvider.myshop.GCMNoti=="on";
                        let alert = this.alertController.create({
                          title: '주문요청이 전달됩니다',
                          buttons: ['OK']
                        });
                        alert.present();
                  },(err)=>{
                      let alert;
                      if(err=="NetworkError"){
                        alert = this.alertController.create({
                          title: '주문알림 요청에 실패했습니다.',
                          subTitle: '네트웍 연결 확인후 다시 시도해 주시기 바랍니다.',
                          buttons: ['OK']
                        });
                      }else{
                        alert = this.alertController.create({
                          title: '주문알림 요청에 실패했습니다.',
                          buttons: ['OK']
                        });
                      }
                      alert.present();
                  });
                }
              }
            ]
          });
          confirm.present();
    }
  }

  requestManager(){
      return new Promise((resolve,reject)=>{
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        console.log("/shop/changeNotiMember-server:"+ this.storageProvider.serverAddress);
        let body= JSON.stringify({ takitId: this.storageProvider.myshop.takitId });

        console.log("body:"+JSON.stringify(body));
        this.serverProvider.post("/shop/changeNotiMember",body).then((res:any)=>{   
          console.log("res:"+JSON.stringify(res));
          if(res.result=="success"){
               resolve(); 
          }else{
                reject();
          }
        },(err)=>{
                reject(err);
        });

      });
  }

  configureStore(){
    console.log("click-configureStore(storeOpen):"+this.storageProvider.storeOpen);
    if(this.storageProvider.tourMode){
          let alert = this.alertController.create({
                      title: '상점문을 열고,닫습니다. ',
                      subTitle:'둘러보기 모드에서는 동작하지 않습니다.',
                      buttons: ['OK']
                  });
          alert.present();
      return;
    }
    if(this.storageProvider.storeOpen===false){
      let alert = this.alertController.create({
                        title: '상점문을 여시겠습니까?',
                        buttons: [{
                            text:'아니오',
                            handler:()=>{
                              console.log("Disagree clicked");
                            }
                          },
                          {
                            text:'네',
                            handler:()=>{
                              this.openStore().then(()=>{
                                  console.log("open shop successfully");
                                  this.storeColor="primary";
                                  this.storageProvider.storeOpen=true;
                              },(err)=>{
                                  if(err=="NetworkFailure"){
                                    let alert = this.alertController.create({
                                                      title: '서버와 통신에 문제가 있습니다',
                                                      subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                                      buttons: ['OK']
                                                  });
                                    alert.present();
                                  }else{
                                    let alert = this.alertController.create({
                                                      title: '샵을 오픈하는데 실패했습니다.',
                                                      subTitle: '고객센터(0505-170-3636)에 문의바랍니다.',
                                                      buttons: ['OK']
                                                  });
                                    alert.present();
                                  }
                              });
                            }}]
                          });
                          alert.present();
    }else{
      let alert = this.alertController.create({
                        title: '상점문을 닫으시겠습니까?',
                        buttons: [{
                            text:'아니오',
                            handler:()=>{
                              console.log("Disagree clicked");
                            }
                          },
                          {
                            text:'네',
                            handler:()=>{
                                this.closeStore().then(()=>{
                                    console.log("close shop successfully");
                                    this.storeColor="gray";
                                    this.storageProvider.storeOpen=false;
                                },(err)=>{
                                    if(err=="NetworkFailure"){
                                      let alert = this.alertController.create({
                                                        title: '서버와 통신에 문제가 있습니다',
                                                        subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                                        buttons: ['OK']
                                                    });
                                      alert.present();
                                    }else{
                                      let alert = this.alertController.create({
                                                        title: '샵을 종료하는데 실패했습니다.',
                                                        subTitle: '고객센터(0505-170-3636)에 문의바랍니다.',
                                                        buttons: ['OK']
                                                    });
                                      alert.present();
                                    }
                                });
                            }
                          }
                        ]
                    });
                    alert.present();
    }
  }

  testPrint(){
    console.log("testPrint comes");
    if(this.storageProvider.printOn==false){
          let alert = this.alertController.create({
                      title: '프린터 설정 메뉴에서 프린터를 설정해주세요.',
                      buttons: ['OK']
                  });
          alert.present();
    }else{
      if(this.platform.is("android")){
        this.printerProvider.print("주문","프린터가 동작합니다").then(()=>{
              console.log("프린트 명령을 보냈습니다. ");
          },()=>{
            let alert = this.alertController.create({
                title: '프린트 명령을 보내는것에 실패했습니다.',
                buttons: ['OK']
            });
            alert.present();
          });
      }else if(this.platform.is("ios")){
        console.log("ios testPrint");
        this.iosPrinterProvider.print("Test","프린터가 동작합니다").then(()=>{
              console.log("프린트 명령을 보냈습니다. ");
          },()=>{
            let alert = this.alertController.create({
                title: '프린트 명령을 보내는것에 실패했습니다.',
                buttons: ['OK']
            });
            alert.present();
          });
      }
    }
  }

    openStore(){
      return new Promise((resolve,reject)=>{
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        console.log("openShop-server:"+ this.storageProvider.serverAddress);
        let body= JSON.stringify({takitId: this.storageProvider.myshop.takitId});

        console.log("body:"+JSON.stringify(body));
        this.serverProvider.post("/shop/openShop",body).then((res:any)=>{   
            console.log("/shop/openShop"+"-res:"+JSON.stringify(res));
            if(res.result=="success"){
                resolve();
            }else
                reject();
         },(err)=>{
           console.log("서버와 통신에 문제가 있습니다");
            reject(err);
         });
      });
    }

    closeStore(){
      return new Promise((resolve,reject)=>{
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        console.log("closeShop-server:"+ this.storageProvider.serverAddress);
        let body= JSON.stringify({takitId:this.storageProvider.myshop.takitId});

        console.log("body:"+JSON.stringify(body));
        this.serverProvider.post("/shop/closeShop",body).then((res:any)=>{   
            console.log("/shop/closeShop"+"-res:"+JSON.stringify(res));
            if(res.result=="success"){
                resolve();
            }else
                reject();
         },(err)=>{
           console.log("서버와 통신에 문제가 있습니다");
            reject(err);
         });
      });
    }

    notifyOrder(order){
        console.log("notifyOrder comes");
        return new Promise((resolve,reject)=>{
        let body= JSON.stringify({ orderId: order.orderId });

        console.log("body:"+JSON.stringify(body));
        this.serverProvider.post("/shop/notifyOrder",body).then((res:any)=>{   
            console.log("...res:"+JSON.stringify(res));
         },(err)=>{
           if(err=="NetworkFailure"){
              console.log("서버와 통신에 문제가 있습니다");
              let alert = this.alertController.create({
                                    title: '서버와 통신에 문제가 있습니다',
                                    subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                    buttons: ['OK']
                                });
                alert.present();
           }else if(err=="HttpFailure"){
              let alert = this.alertController.create({
                                    title: '서버로 부터 정상응답을 받지 못하였습니다.',
                                    buttons: ['OK']
                                });
                alert.present();           
            }
         });
      });
     }
}
