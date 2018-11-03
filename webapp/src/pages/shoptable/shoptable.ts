import {Component,EventEmitter,NgZone} from '@angular/core';
import {NavController,App,AlertController,Platform, LoadingController,MenuController,IonicApp,ViewController,Events} from 'ionic-angular';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';
import {StorageProvider} from '../../providers/storageProvider';
//import {MediaProvider} from '../../providers/mediaProvider';
import {Http,Headers} from '@angular/http';
import {ErrorPage} from '../../pages/error/error';
//import {PrinterProvider} from '../../providers/printerProvider';
import {ServerProvider} from '../../providers/serverProvider';
//import { Push, PushObject, PushOptions } from '@ionic-native/push';
import {CancelConfirmPage} from '../cancel-confirm/cancel-confirm';
//import {IosPrinterProvider} from '../../providers/ios-printer';
//import { BackgroundMode } from '@ionic-native/background-mode';
import {TimeUtil} from '../../classes/TimeUtil';
//import { Socket } from 'ng-socket-io';
//import { TextToSpeech } from '@ionic-native/text-to-speech';
import { NativeStorage } from '@ionic-native/native-storage';

declare var cordova:any;
var gShopTablePage;

@Component({
  selector:'page-shoptable',
  templateUrl: 'shoptable.html',
})

export class ShopTablePage {
  Option="today";
  startDate;
  endDate;
  orders=[];
  //pushNotification:PushObject;
  infiniteScroll:any=undefined;
  smsInboxPlugin;
  storeColor="gray";
  notiColor="gray";
  printColor="gray";
  printerEmitterSubscription;

  column=1; //default value

  timeUtil= new TimeUtil(); 
  
  registrationId; // socket에 전달할 registrationId를 저장함.

  pollingAlert=false;
  //disconnectAlert=false;

  waiteeBackgroundColor={};

  getTodayString(){
    var d = new Date();
    var mm = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1); // getMonth() is zero-based
    var dd  = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
    var dString=d.getFullYear()+'-'+(mm)+'-'+dd;
    return dString;
  }
  
  platformName; //android,ios

  constructor(public navController: NavController,private app:App,private storageProvider:StorageProvider,
      private http:Http,private alertController:AlertController,private ngZone:NgZone,private ionicApp: IonicApp,
      private platform:Platform,private menuCtrl: MenuController,
      public viewCtrl: ViewController,private serverProvider:ServerProvider,
      private events:Events,
      public loadingCtrl: LoadingController, 
      private nativeStorage: NativeStorage) {
    console.log("ShopTablePage constructor");
      gShopTablePage=this;

      platform.ready().then(() => {
            console.log('Width: ' + platform.width());
            console.log('Height: ' + platform.height());
            if(platform.width()/2>380){ // Hum... Just for kalen's tablet. 380
                // hum... display two columns 
                this.column=2;
            }else{
                // display one columns
                this.column=1;
            }
            this.column=1;// do not display column as 2
            /////////////////////////////////////////////////
            if(this.storageProvider.device)
                this.registerPushService();

        this.nativeStorage.getItem("pollingInterval").then((value:string)=>{
            console.log("volume is "+value+" in storage");
            if(value==null || value==undefined){
                this.storageProvider.pollingInterval=3; // 3 minutes
            }else{
                this.storageProvider.pollingInterval= parseInt(value);
                if(this.storageProvider.pollingInterval<1 || this.storageProvider.pollingInterval>3){ //invalid value
                    this.storageProvider.pollingInterval=3;
                }
            }
            console.log("pollingInterval:"+this.storageProvider.pollingInterval);
        });    

        // 최대 3분마다 주문 내역을 가지고 온다.
        this.storageProvider.pollingTimer=setInterval(function(){
            console.log("setInterval "+gShopTablePage.Option);
            if(gShopTablePage.Option=='today'){
                let body; 
                if(gShopTablePage.orders.length>0){
                    body  = JSON.stringify({takitId: gShopTablePage.storageProvider.myshop.takitId, orderNO:gShopTablePage.orders[0].orderNO, time:gShopTablePage.orders[0].orderedTime}); //humm... more than last ordered time?
                }else{
                    let now=new Date();
                    let oneHourAgo=new Date(now.getTime()-60*60*1000) ;// one hour ago? today's open hour? 오늘 local time을 구해서 gmt시간으로 변경하자.
                    body=JSON.stringify({takitId: gShopTablePage.storageProvider.myshop.takitId, orderNO: 0,time: oneHourAgo.toISOString() }); // humm... less than one hours?
                }

                let bodyObj=JSON.parse(body);
                let prevOrderNO=bodyObj.orderNO;

                var d = new Date();
                console.log("getRecentOrder: "+d.toLocaleTimeString());

                gShopTablePage.serverProvider.post("/shop/getRecentOrder",body).then((res:any)=>{
                    console.log("res.more:"+res.more);
                    if(res.more){
                        //Please check if order is alreay printed or not.
                        // 여러개가 출력되지 않았다며 여러개의 출력이 필요하다. 보강 코드가 필요함.
                            gShopTablePage.orders=[];
                            gShopTablePage.getOrders(-1,-1).then(()=>{
                                for(let j=0;gShopTablePage.orders[j].orderNO>prevOrderNO;j++){
                                    if(gShopTablePage.orders[j].orderStatus=="paid"){  // 기존에 출력이 되었는지 확인이 필요하다. 마지막 출력된 orderNO의 저장이 필요하다. 
                                          gShopTablePage.printOrder(gShopTablePage.orders[j],true);
                                          gShopTablePage.mediaProvider.play();
                                    } 
                                }
                            });
                    }
                },err=>{
                    console.log("fail to check recent order");
                    gShopTablePage.mediaProvider.playWarning();
                })

                if(gShopTablePage.storageProvider.kiosk){
                        gShopTablePage.serverProvider.post("/kiosk/getKioskRecentOrder",body).then((res:any)=>{
                            console.log("res.more:"+res.more);
                            if(res.more){
                                gShopTablePage.orders=[];
                                gShopTablePage.getOrders(-1,-1).then(()=>{
                                    for(let j=0;gShopTablePage.orders[j].orderNO>prevOrderNO;j++){
                                        if(gShopTablePage.orders[j].orderStatus=="paid"){  // 기존에 출력이 되었는지 확인이 필요하다. 마지막 출력된 orderNO의 저장이 필요하다. 
                                            gShopTablePage.printOrder(gShopTablePage.orders[j],true);
                                            gShopTablePage.mediaProvider.play();
                                        }else if(gShopTablePage.orders[j].orderStatus=="unpaid"){
                                            gShopTablePage.speakCash(gShopTablePage.orders[j]);
                                        } 
                                    }
                                });
                            }
                        },err=>{
                            console.log("fail to check recent order");
                            gShopTablePage.mediaProvider.playWarning();
                        })
                        }
            }
            if(this.storageProvider.isMobile){
                if(!this.socket.ioSocket.connected){
                            this.socket.connect();
                }
            }
        }, gShopTablePage.storageProvider.pollingInterval*60*1000); //every 3 minutes 

    });

    var date=new Date();
    var month=date.getMonth()+1;

    this.startDate=this.getTodayString();
    this.endDate=this.getTodayString();

    console.log("startDate:"+this.startDate);
    console.log("endDate:"+this.endDate);

    // this.getOrders(-1,-1); 

    console.log("this.storageProvider.myshop.GCMNoti:"+this.storageProvider.myshop.GCMNoti);

    if(this.storageProvider.myshop.GCMNoti=="off"){
      this.notiColor="gray";
    }else if(this.storageProvider.myshop.GCMNoti=="on"){
      this.notiColor="#33b9c6";
    }else{
      console.log("unknown GCMNoti");
    }

    console.log("!!! storeOpen:"+this.storageProvider.storeOpen);
    if(this.storageProvider.storeOpen==true){
      this.storeColor="#33b9c6";
    }else{ 
      this.storeColor="gray";  
    }
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
     
          if(this.storageProvider.device){
                cordova.plugins.backgroundMode.setDefaults({
                    title:  '타킷운영자가 실행중입니다',
                    ticker: '주문알림 대기',
                    text:   '타킷운영자가 실행중입니다'
                });
                
                cordova.plugins.backgroundMode.enable(); //takitShop always runs in background Mode
          }
          //get shopInfo from server
          console.log("call getShopInfoAll");

          this.serverProvider.getShopInfoAll(this.storageProvider.myshop.takitId).then((res:any)=>{
              console.log("shopInfo:"+JSON.stringify(res));
              this.storageProvider.shopInfoSet(res.shopInfo);
              this.storageProvider.shop = res;
              if(res.shopInfo.kiosk!=null){
                    console.log("kiosk exists in shop");
                    this.storageProvider.kiosk=true;
                    this.waiteeBackgroundColor={waiteeBackgroundColor:true};
              }
              if(res.shopInfo.storeType && res.shopInfo.storeType!=null){
                    this.storageProvider.storeType=res.shopInfo.storeType;
              }
              console.log("call getOrders");
              this.getOrders(-1,-1); 

              // 내일 상점 시작 한시간전에 restart를 실행한다.
              console.log("this.storageProvider.shop.businessTime:"+res.shopInfo.businessTime);
              //this.storageProvider.shop.businessTime=JSON.parse(res.shopInfo.businessTime);
              let businessTime=JSON.parse(res.shopInfo.businessTime);;
              let today=new Date();
              let weekday=today.getDay();
              let startHour,startMin;
              if(weekday==6){
                    weekday=0;
              }else{
                    weekday=weekday+1;
              }
              ////////////////////////////
              console.log("tomorrow open hour:"+businessTime[weekday].substr(0,2));
              this.storageProvider.bootTime=today.toLocaleString();
              let hour=parseInt(businessTime[weekday].substr(0,2));
              // 오늘에서 24시간 더한후에 open hour로 시간설정하고 다시 1시간뺀이후에 timer를 걸면된다.
              let tomorrow=new Date(today.getTime()+24*60*60*1000);
              tomorrow.setHours(hour,0,0,0);
              let restart=new Date(tomorrow.getTime()-60*60*1000); // one hour ago 
              console.log("restart time:"+restart.toLocaleString()+" diff:"+(restart.getTime()-today.getTime()));
              if(restart.getTime()-today.getTime()>60*60*1000){
                    setTimeout(function(){
                        //remove logs in DB
                        // 나중에 적용하자 우선은 버튼으로 수동으로 삭제하기.
                        gShopTablePage.storageProvider.deleteLog().then(()=>{
                            cordova.plugins.restart.restart();    
                        },err=>{
                            cordova.plugins.restart.restart();
                        });
                    },restart.getTime()-today.getTime());
              }else{
                    setTimeout(function(){
                        //remove logs in DB
                         // 나중에 적용하자 우선은 버튼으로 수동으로 삭제하기.
                        gShopTablePage.storageProvider.deleteLog().then(()=>{
                            cordova.plugins.restart.restart();    
                        },err=>{
                            cordova.plugins.restart.restart();  
                        });
                    },restart.getTime()-today.getTime()+24*60*60*1000);
              }
              
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


        let body = JSON.stringify({takitId:this.storageProvider.myshop.takitId});
        this.serverProvider.post("/shop/getShopInfo",body).then((res:any)=>{
          console.log("/shop/getShopInfo "+JSON.stringify(res));
          if(res.result=="success"){
              this.ngZone.run(()=>{
                if(res.shopInfo.business=="on"){
                     this.storeColor="#33b9c6";
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

    convertKioskOrderInfo(orderInfo){
        let order:any={};
        order=orderInfo;
        //console.log("!!!kiosk-order:"+JSON.stringify(order));
        order.statusString=this.getStatusString(order.orderStatus);
          if(order.orderStatus=="pickup" || order.orderStatus=="cancelled")
            order.hidden=true;
          else  
            order.hidden=false;

          if(order.hasOwnProperty("review") && order.review!=null){
                order.hidden=false;
          }  

          console.log("order.orderList:"+order.orderList);
          order.orderListObj=JSON.parse(order.orderList);

          console.log("menus:"+ order.orderListObj.menus);
          if( typeof order.orderListObj.menus ==="string"){
                console.log("order.orderListObj.menus:"+order.orderListObj.menus);
                order.orderListObj.menus=JSON.parse(order.orderListObj.menus);
          }
          //console.log("order.orderListObj:"+JSON.stringify(order.orderListObj));
          console.log("cancelReason:"+order.cancelReason);
          if(order.cancelReason!=undefined &&
                order.cancelReason!=null &&
                order.cancelReason!="")
            order.cancelReasonString=order.cancelReason;
          else
            order.cancelReasonString=undefined;
        ///////////////////////////////////////////////////////////////////////////////////////////////////
          if(order.orderStatus=="cancelled"){
              if(order.hasOwnProperty("cancelledTime")){
                  console.log("call getLocalTimeString")
                  order.localCancelledTimeString=this.timeUtil.getlocalTimeStringWithoutDay(order.cancelledTime);
              }
          }else{
                  order.localCancelledTimeString=undefined;
          }

          if(order.hasOwnProperty('completedTime') && order.completedTime!=null){
              console.log("completedTime:"+order.completedTime);
              order.localCompleteTimeString=this.timeUtil.getlocalTimeStringWithoutDay(order.completedTime);
          }
          if(order.hasOwnProperty('checkedTime') && order.completedTime!=null){
              console.log("checkedTime:"+order.checkedTime);
              order.localCheckedTimeString=this.timeUtil.getlocalTimeStringWithoutDay(order.checkedTime);        
          }
          if(order.hasOwnProperty('pickupTime') && order.pickupTime!=null){
              console.log("pickupTime:"+order.pickupTime);
              order.localPickupTimeString=this.timeUtil.getlocalTimeStringWithoutDay(order.pickupTime);        
          }
          if(order.hasOwnProperty('orderedTime') && order.orderedTime!=null){
              order.localOrderedTimeString=this.timeUtil.getlocalTimeStringWithoutDay(order.orderedTime);
          }
          //console.log("kiosk-order result:"+JSON.stringify(order));
          return order;
    }

    convertOrderInfo(orderInfo){
        if(orderInfo.type){
            return this.convertKioskOrderInfo(orderInfo);
        }else{
          var order:any={};
          order=orderInfo;
          //console.log("!!!order:"+JSON.stringify(order));
          //var date=new Date(orderInfo.orderedTime);

          //console.log("local ordered time:"+ date.toLocaleString());//date.toLocaleDateString('ko-KR')
          order.statusString=this.getStatusString(order.orderStatus);
          if(order.orderStatus=="pickup" || order.orderStatus=="cancelled")
            order.hidden=true;
          else  
            order.hidden=false;

          if(order.hasOwnProperty("review") && order.review!=null){
                order.hidden=false;
          }  

          console.log("order.orderList:"+order.orderList);
          order.orderListObj=JSON.parse(order.orderList);

          console.log("menus:"+ order.orderListObj.menus);
          if( typeof order.orderListObj.menus ==="string"){
                console.log("order.orderListObj.menus:"+order.orderListObj.menus);
                order.orderListObj.menus=JSON.parse(order.orderListObj.menus);
          }
          order.userPhoneHref="tel:"+order.userPhone; 
          //console.log("order.orderListObj:"+JSON.stringify(order.orderListObj));
          console.log("cancelReason:"+order.cancelReason);
          if(order.cancelReason!=undefined &&
                order.cancelReason!=null &&
                order.cancelReason!="")
            order.cancelReasonString=order.cancelReason;
          else
            order.cancelReasonString=undefined;
        ///////////////////////////////////////////////////////////////////////////////////////////////////
          if(order.orderStatus=="cancelled"){
              if(order.hasOwnProperty("cancelledTime")){
                  console.log("call getLocalTimeString")
                  order.localCancelledTimeString=this.timeUtil.getlocalTimeStringWithoutDay(order.cancelledTime);
              }
          }else{
                  order.localCancelledTimeString=undefined;
          }

          if(order.hasOwnProperty('completedTime') && order.completedTime!=null){
              console.log("completedTime:"+order.completedTime);
              order.localCompleteTimeString=this.timeUtil.getlocalTimeStringWithoutDay(order.completedTime);
          }
          if(order.hasOwnProperty('checkedTime') && order.completedTime!=null){
              console.log("checkedTime:"+order.checkedTime);
              order.localCheckedTimeString=this.timeUtil.getlocalTimeStringWithoutDay(order.checkedTime);        
          }
          if(order.hasOwnProperty('pickupTime') && order.pickupTime!=null){
              console.log("pickupTime:"+order.pickupTime);
              order.localPickupTimeString=this.timeUtil.getlocalTimeStringWithoutDay(order.pickupTime);        
          }
          if(order.hasOwnProperty('orderedTime') && order.orderedTime!=null){
              order.localOrderedTimeString=this.timeUtil.getlocalTimeStringWithoutDay(order.orderedTime);
          }
          if(order.hasOwnProperty('reviewTime') && order.reviewTime!=null){
              order.localReviewTimeString=this.timeUtil.getlocalTimeStringWithoutDay(order.reviewTime);        
          }
      ///////////////////////////////////////////////////////////////////////////////////////////////////
          return order;
        }
    }

     getOrders(lastOrderId,lastKioskOrderId){
      return new Promise((resolve,reject)=>{
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        console.log("getOrders-server:"+ this.storageProvider.serverAddress);
        let body:any;
        if(this.Option!="period"){
              body  = {  option: this.Option,
                                        takitId:this.storageProvider.myshop.takitId,
                                        lastOrderId:lastOrderId, 
                                        limit:this.storageProvider.OrdersInPage};
        }else{
              console.log("this.startDate:"+this.startDate);

              var startDate=new Date(this.startDate);
              var endDate= new Date(this.endDate);
              body  = {  option: this.Option,
                                        takitId:this.storageProvider.myshop.takitId,
                                        lastOrderId:lastOrderId,
                                        limit:this.storageProvider.OrdersInPage,
                                        startTime:startDate.toISOString(), 
                                         endTime:endDate.toISOString()
                                      };
        }
        let reqUrl="/shop/getOrders";

        console.log("body:"+JSON.stringify(body));

        if(this.storageProvider.kiosk){
            body.lastKioskOrderId=lastKioskOrderId;
            reqUrl="/kiosk/getOrders";
        }
         console.log("body:"+JSON.stringify(body));
         this.serverProvider.post(reqUrl,JSON.stringify(body)).then((res:any)=>{  
            console.log("!!!getOrders-res:"+JSON.stringify(res));
            var result:string=res.result;
            if(result==="success" &&Array.isArray(res.orders)){
              console.log("res.length:"+res.orders.length);
              res.orders.forEach(order=>{
                  //console.log("****order:"+JSON.stringify(order));  
                  console.log("order.orderedTime:"+order.orderedTime);
                  this.orders.push(this.convertOrderInfo(order));
              });
              console.log("orders.length:"+this.orders.length);
              //orderedTime으로 소팅은 서버에서 한다. Why app에서 정상으로 안될까? 나중에 검증하자.
              this.orders.sort(function(a, b){
                  let aDate=new Date(a.orderedTime);
                  let bDate=new Date(b.orderedTime);
                  if(aDate>bDate){
                      return -1;
                  }else if(aDate<bDate){
                       return 1;
                  }
                  return 0;
              });
              
              //console.log("orders:"+JSON.stringify(this.orders))
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
        this.getOrders(-1,-1);
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
    this.getOrders(-1,-1);
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
    
    printCancel(order){  // 마지막 출력된 취소 주문의 NO를 저장하자!!! 재출력되지 않도록...

    }

    printOrder(order,auto){

    }

    printOrderJob(order){  
      return new Promise((resolve,reject)=>{

      var title="",message="";
      console.log("order:"+JSON.stringify(order));
      if(order.orderStatus=="paid" ||order.orderStatus=="checked"){
          title+="\n"+this.timeUtil.getlocalTimeStringWithoutYear(order.orderedTime); 
          if(this.platform.is('android')){
              title+="웨이티["+order.orderNO+"]";
              if(order.takeout=='1'){          
                title+="\n\n\n포장";
              }else if(order.takeout=='2'){
                title+="\n\n\n배달"; 
                message=order.deliveryAddress+"\n";
              }
          }else if(this.platform.is('ios')){
              title+="ORDER["+order.orderNO+"]";
              if(order.takeout=='1')          
                title+="\nTakeout";
              else if(order.takeout=='2'){
                title+="\nDelivery"; 
                message="배달장소:"+order.deliveryAddress+"\n";
              }
          }

          if(order.orderListObj.menus){              
                order.orderListObj.menus.forEach((menu)=>{
                    message+="-------------\n";
                    message+=" "+menu.menuName+"("+menu.quantity+")\n"; 
                    menu.options.forEach((option)=>{
                        message+=" "+option.name;
                        if(option.number!=undefined && option.number>1){
                           message+=" "+option.number;    
                        }
                        if(option.select!=undefined){
                        message+="("+option.select+")";
                        }
                        message+="\n";
                    });
                        if(menu.memo && menu.memo!=null){
                            message+=menu.memo;
                            message+="\n";
                            message+="-------------\n";
                        }
                });
          }else if(order.orderListObj){
                order.orderListObj.forEach((menu)=>{
                    message+="-------------\n";
                    message+=" "+menu.menuName+"("+menu.quantity+")\n"; 
                    menu.options.forEach((option)=>{
                        message+=" "+option.name;
                        if(option.number!=undefined  && option.number>1){
                           message+=" "+option.number;    
                        }
                        if(option.select!=undefined){
                        message+="("+option.select+")";
                        }
                        message+="\n";
                    });
                        if(menu.memo && menu.memo!=null){
                            message+=menu.memo;
                            message+="\n";
                            message+="-------------\n";
                        }
                });
          }
      }else if(order.orderStatus=="completed" || order.orderStatus=="pickup"){ //print receipt
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
          if(order.orderListObj.menus){
                order.orderListObj.menus.forEach((menu)=>{
                    message+="-------------\n";
                    message+=" "+menu.menuName+"("+menu.quantity+")\n"; 
                    menu.options.forEach((option)=>{
                        message+=" "+option.name;
                        if(option.number!=undefined  && option.number>1){
                           message+=" "+option.number;    
                        }
                        if(option.select!=undefined){
                        message+="("+option.select+")";
                        }
                        message+=menu.quantity*option.price+"\n";
                    });
                    message+=" "+menu.amount;
                });    
          }else if(order.orderListObj){
                order.orderListObj.forEach((menu)=>{
                    message+="-------------\n";
                    message+=" "+menu.menuName+"("+menu.quantity+")\n"; 
                    menu.options.forEach((option)=>{
                        message+=" "+option.name;
                        if(option.number!=undefined  && option.number>1){
                           message+=" "+option.number;    
                        }
                        if(option.select!=undefined){
                        message+="("+option.select+")";
                        }
                        message+=menu.quantity*option.price+"\n";
                    });
                    message+=" "+menu.amount;
                });    
          }      
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
          if(order.orderListObj.menus){
            order.orderListObj.menus.forEach((menu)=>{
                message+="-------------\n";
                message+=" "+menu.menuName+"(-"+menu.quantity+")\n"; 
                menu.options.forEach((option)=>{
                    message+=" "+option.name;
                    if(option.number!=undefined  && option.number>1){
                           message+=" "+option.number;    
                    }
                    if(option.select!=undefined){
                    message+="("+option.select+")";
                    }
                    message+="\n";
                });
            });          
          }else if(order.orderListObj){
            order.orderListObj.forEach((menu)=>{
                message+="-------------\n";
                message+=" "+menu.menuName+"(-"+menu.quantity+")\n"; 
                menu.options.forEach((option)=>{
                    message+=" "+option.name;
                    if(option.number!=undefined  && option.number>1){
                           message+=" "+option.number;    
                    }
                    if(option.select!=undefined){
                    message+="("+option.select+")";
                    }
                    message+="\n";
                });
            });          
          }
          message+="\n";
          let totalAmount=order.amount;
          let tax=Math.round(totalAmount/11.0);
          let amount=totalAmount-tax;
          message+="판매금액  -"+amount +"원";
          message+="부가가치세  -"+tax +"원";
          message+="합계     -"+totalAmount+"원";          
      }
      if(this.platform.is('android')){
            
      }else if(this.platform.is('ios')){
            
      }
      });
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

     orderNotificationSocket(incommingOrder){
                console.log("!!!orderNotificationSocket!!!");
                var playback=false;
                if(this.Option!="period" ||(this.Option=="period" && this.hasItToday() )){
                       //새로운 order이거나 order가 cancel되었다면(order의 상태가 일치하지 않는다면)  
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
                            this.orders=[];
                            this.getOrders(-1,-1);
                            if(newOrder.orderStatus=="paid"){
                                  this.printOrder(newOrder,true);
                                  playback=true;
                            }else if(newOrder.orderStatus=="unpaid"){
                                  this.speakCash(newOrder);
                            }
                        }else{
                           if(incommingOrder.orderStatus=="cancelled" &&  this.orders[i].orderStatus=="paid"){
                                this.orders[i]=this.convertOrderInfo(incommingOrder);   
                                        this.printCancel(this.orders[i]);
                                        if(!this.paidOrdersExist()){
                                            playback=false;       
                                        }
                           }else{
                                this.orders[i]=this.convertOrderInfo(incommingOrder);
                           }
                        }
                        console.log("orders update:"+JSON.stringify(this.orders));
                }
                if(playback){

                }else{
                    this.checkPaidOrderExist();
                }
     }

    checkPaidOrderExist(){
        let i=0,paidExist=false;

        for(;i<this.orders.length;i++){
            if(this.orders[i].orderStatus=="paid"){
                paidExist=true;
                break;
            }
        }
        if(!paidExist){
        }
    }
    
      registerPushService(){ // Please move this code into tabs.ts
    }

    notifyAudio(order){
        if(this.storageProvider.isMobile && this.storageProvider.device && this.storageProvider.kiosk){

        }
    }

    notifyCancelAudio(order){
        if(this.storageProvider.isMobile && this.storageProvider.device && this.storageProvider.kiosk){

        }
    }

    updateKioskOrder(order){
        if(this.storageProvider.tourMode){
              let alert = this.alertController.create({
                          title: '주문을 처리합니다.',
                          subTitle:'둘러보기 모드에서는 동작하지 않습니다.',
                          buttons: ['OK']
                      });
              alert.present();
          return;
        }
        if(order.orderStatus=="unpaid"){
               let confirm = this.alertController.create({
                title: '고객님으로 부터 현금 '+order.amount+'원을 받으셨나요?',
                buttons: [{
                            text: '아니오',
                            handler: () => {
                              console.log('Disagree clicked');
                            }
                          },
                          {
                            text: '네',
                            handler: () => {
                                this.updateKioskStatus(order,"paidCheckOrder").then(()=>{
                                  order.orderStatus="checked";
                                  order.statusString="준비"; 
                                  order.checkedTime=new Date().toISOString();
                                  this.printOrder(order,false);
                                },()=>{
                                  console.log("주문 접수에 실패했습니다.");
                                  let alert = this.alertController.create({
                                                  title: '주문 접수에 실패했습니다.',
                                                  buttons: ['OK']
                                              });
                                    alert.present();
                                });;
                            }
                      }]});
              confirm.present();
        }else if(order.orderStatus=="paid"){
               this.updateKioskStatus(order,"checkOrder").then(()=>{
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
                                this.updateKioskStatus(order,"completeOrder").then(()=>{
                                  order.orderStatus="completed";
                                  order.statusString="전달"; 
                                  order.completedTime=new Date().toISOString();
                                  //sound를 전달한다.
                                  this.notifyAudio(order)
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
                                this.updateKioskStatus(order,"pickupOrder").then(()=>{
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
                                  this.notifyAudio(order)
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

    cancelKioskOrder(order,cancelReason:string){
      return new Promise((resolve,reject)=>{
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let body= JSON.stringify({ orderId: order.orderId,cancelReason:cancelReason});

        console.log("body:"+JSON.stringify(body));

        let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: 30*1000
        });
        progressBarLoader.present();

        this.serverProvider.post("/kiosk/cancelOrder",body).then((res:any)=>{ 
            console.log("res:"+JSON.stringify(res));
            progressBarLoader.dismiss();
            if(res.result=="success"){
                 order.orderStatus="cancelled";
                 order.statusString="취소"; 
                 order.cancelReasonString=cancelReason;
                 order.cancelledTime=new Date().toISOString();
                 order.localCancelledTime=new Date().toString(); // Temporary code. Please set this value with the response value of server.
                 order.hidden=true;
                 // 주문 취소를 고객에게 알리자.
                 this.notifyCancelAudio(order);
                resolve();
            }else{
                reject();
            }
         },(err)=>{
             progressBarLoader.dismiss();
           if(err=="NetworkFailure"){
              console.log("서버와 통신에 문제가 있습니다");
              let alert = this.alertController.create({
                                    title: '서버와 통신에 문제가 있습니다',
                                    subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                    buttons: ['OK']
                                });
              alert.present();
           }else if(err=="HttpFailure"){
              console.log("kiosk/cancelOrder-HttpFailure");
           }
         });
      });
    }

    cancelOrder(order,cancelReason:string){
      return new Promise((resolve,reject)=>{
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let body= JSON.stringify({ orderId: order.orderId,cancelReason:cancelReason});

        console.log("body:"+JSON.stringify(body));
        let progressBarLoader = this.loadingCtrl.create({
            content: "진행중입니다.",
            duration: 30*1000
        });
        progressBarLoader.present();

        this.serverProvider.post("/shop/cancelOrderWithEmail",body).then((res:any)=>{ 
            progressBarLoader.dismiss();
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
             progressBarLoader.dismiss();
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
            if(order.type=='kiosk'){
                this.cancelKioskOrder(order,reason).then((result)=>{
                    console.log("cancel-order result:"+result);
                    resolve();
                },(err)=>{
                    console.log("cancel-order err:"+err);
                    reject();
                });
            }else{
                this.cancelOrder(order,reason).then((result)=>{
                    console.log("cancel-order result:"+result);
                    resolve();
                },(err)=>{
                    console.log("cancel-order err:"+err);
                    reject();
                });
            }
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

    updateKioskStatus(order,request){
      return new Promise((resolve,reject)=>{
        let body= JSON.stringify({ orderId: order.orderId, payment:order.paymentType });

        console.log("body:"+JSON.stringify(body));
        this.serverProvider.post("/kiosk/"+request,body).then((res:any)=>{   
            console.log(request+"-res:"+JSON.stringify(res));
            if(res.result=="success"){
                resolve("주문상태변경에 성공했습니다");
                if(res.msgSentFail && res.msgSentFail==true){
                    let alert = this.alertController.create({
                                title: '주문상태는 변경되었으나 고객에게 주문서가 전달되지 않았습니다.',
                                subTitle:'고객님이 입력하신 스마트폰 정보가 잘못되었을수 있습니다. 고객문의시 알려주세요.',
                                buttons: ['OK']
                            });
                    alert.present();
                }
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

     findLastOrderId(){
        let lastOrderId=-1;
        console.log("findLastOrderId\n");

        for(let i=this.orders.length-1;i>=0;i--){
            console.log("i:"+i+" type:"+ this.orders[i].type);
            if(!this.orders[i].type){
                lastOrderId=this.orders[i].orderId;
                break;
            }
        }
        return lastOrderId;
     }

     findLastKioskId(){
        let lastOrderId=-1;
        for(let i=this.orders.length-1;i>=0;i--){
            console.log("***********i:"+i+ "orderId:"+this.orders[i].orderId+ "type:"+this.orders[i].type);
            if(this.orders[i].type && this.orders[i].type=="kiosk"){
                lastOrderId=this.orders[i].orderId;
                break;
            }
        }
        return lastOrderId;
     }

     doInfinite(infiniteScroll){
        console.log("doInfinite");

        let lastOrderId= this.findLastOrderId();
        let lastKioskId=-1;

        if(this.storageProvider.kiosk){
             lastKioskId=this.findLastKioskId();
        }
        console.log("*********lastOrderId:"+lastOrderId);
        console.log("**********lastKioskId:"+lastKioskId);
        this.getOrders(lastOrderId,lastKioskId).then((more)=>{
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
         return '#33b9c6';
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
    ///////////////////////////////////////////////////////////  
    this.orders=[];
    if(this.infiniteScroll!=undefined)
        this.infiniteScroll.enable(true);
    this.getOrders(-1,-1);
    let body= JSON.stringify({ takitId: this.storageProvider.myshop.takitId});
    this.serverProvider.post("/shop/refreshInfo",body).then((res:any)=>{
        console.log("res:"+JSON.stringify(res));
        if(res.result=="success"){
          this.ngZone.run(()=>{
            if(res.shopUserInfo.GCMNoti=="on"){
                this.notiColor="#33b9c6";
                this.storageProvider.amIGotNoti=true;
            }else{ // This should be "off"
                this.notiColor="gray";
                this.storageProvider.amIGotNoti=false;
            }
            if(res.shopInfo.business=="on"){
                this.storeColor="#33b9c6";
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
                this.notiColor="#33b9c6";
                this.storageProvider.amIGotNoti=true;
            }else{ // This should be "off"
                this.notiColor="gray";
                this.storageProvider.amIGotNoti=false;
            }
            if(res.shopInfo.business=="on"){
                this.storeColor="#33b9c6";
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
                        this.notiColor="#33b9c6";
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
        let alert = this.alertController.create({
                    title: '상점문을 열고,닫기는 메뉴->환경설정->상점열고닫기를 통해 가능합니다.',
                    buttons: ['OK']
                });
        alert.present();
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

      }else if(this.platform.is("ios")){
        console.log("ios testPrint");
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
            this.notifyAudio(order);
            if(order.type && order.type=='kiosk'){
                return;
            }
            let body= JSON.stringify({ orderId: order.orderId });

            console.log("body:"+JSON.stringify(body));
            this.serverProvider.post("/shop/notifyOrder",body).then((res:any)=>{   
                console.log("...res:"+JSON.stringify(res));
                let alert = this.alertController.create({
                                        title: '고객님께 알림이 전달되었습니다.',
                                        buttons: ['OK']
                                    });
                    alert.present();
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
            /*
        let name=order.orderName;
        let options={
            text:order.orderNO+'번'+name+'이 준비되었습니다.',
            locale:'ko-KR',
            rate:0.7
        }
        //https://stackoverflow.com/questions/40894457/difference-between-android-speech-to-text-api-recognizer-intent-and-google-clo
        this.tts.speak( options)
        .then(() => console.log('Success'))
        .catch((reason: any) => console.log(reason))
       */

      });
     }

    stringToArrayBuffer(string) {
        var buf = new ArrayBuffer(string.length);
        var bufView = new Uint8Array(buf);
        for (var i = 0, strLen = string.length; i < strLen; i++) {
        bufView[i] = string.charCodeAt(i);
        }
        return buf;
    }

    speakCash(order){
        
    }

}
