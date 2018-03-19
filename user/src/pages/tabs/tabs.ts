import { Component ,ViewChild} from '@angular/core';
import { AlertController ,App,Tabs,Platform,IonicApp,Events,ModalController,MenuController,ViewController,NavController} from 'ionic-angular';
import { HomePage } from '../home/home';
import {MyFavoritePage} from '../my-favorite/my-favorite';
import {MyInfoPage} from '../my-info/my-info';
import {OrderListPage} from '../order-list/order-list';
import {WalletPage} from '../wallet/wallet';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import {CartProvider} from '../../providers/cart/cart';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { ErrorPage } from '../error/error';
import {OrderDetailPage} from '../order-detail/order-detail';
import {CashConfirmPage} from '../cash-confirm/cash-confirm';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild('tabs') tabs:Tabs;
  pushNotification:PushObject;

  tab1Root = HomePage;
  tab2Root = MyFavoritePage;
  tab3Root = OrderListPage;
  tab4Root = WalletPage;
  tab5Root = MyInfoPage;

  constructor(public serverProvider:ServerProvider,
              private alertCtrl:AlertController,
              private platform: Platform,
              private ionicApp: IonicApp,
              private menuCtrl: MenuController,
              private navController: NavController,
              private app:App,
              private push: Push,
              public events: Events,
              public viewCtrl: ViewController,
              private backgroundMode:BackgroundMode,
              public modalCtrl: ModalController,
              private cartProvider:CartProvider,
              public storageProvider:StorageProvider){
  
    if(this.storageProvider.cashId!=undefined && this.storageProvider.cashId.length>=5){
        let body = {cashId:this.storageProvider.cashId};
        console.log("getBalanceCash "+body);
        this.serverProvider.post(this.storageProvider.serverAddress+"/getBalanceCash",body).then((res:any)=>{
            console.log("getBalanceCash res:"+JSON.stringify(res));
            if(res.result=="success"){
                this.storageProvider.cashAmount=res.balance;
            }else{
                let alert = this.alertCtrl.create({
                    title: "캐시정보를 가져오지 못했습니다.",
                    buttons: ['OK']
                });
                alert.present();
            }
        },(err)=>{
                    if(err=="NetworkFailure"){
                                let alert = this.alertCtrl.create({
                                    title: "서버와 통신에 문제가 있습니다.",
                                    buttons: ['OK']
                                });
                                alert.present();
                    }else{
                        console.log("Hum...getBalanceCash-HttpError");
                    } 
        });
    }

    platform.ready().then(() => {
        if(this.storageProvider.tourMode==false){
            console.log("call registerPushService");
            this.registerPushService(); 
        }
        //if(this.storageProvider.tourMode==false){    
            this.cartProvider.open().then(()=>{

            },()=>{
                let alert = this.alertCtrl.create({
                                title: "디바이스 문제로 인해 장바구니가 정상동작하지 않습니다.",
                                buttons: ['OK']
                            });
                alert.present();

            })
        //}     
    });

    events.subscribe('cashUpdate', (param) =>{
        console.log("cashUpdate comes at TabsPage");
        if(this.storageProvider.cashId!=undefined && this.storageProvider.cashId.length>=5){
            let body = {cashId:this.storageProvider.cashId};

            this.serverProvider.post(this.storageProvider.serverAddress+"/getBalanceCash",body).then((res:any)=>{
                console.log("getBalanceCash res:"+JSON.stringify(res));
                if(res.result=="success"){
                    this.storageProvider.cashAmount=res.balance;
                }else{
                    let alert = this.alertCtrl.create({
                        title: "캐시정보를 가져오지 못했습니다.",
                        buttons: ['OK']
                    });
                    alert.present();
                }
            });
        }
    });            
  }
  
  ionViewDidLoad() {
      this.storageProvider.tabs=this.tabs;
       if(this.storageProvider.tourMode==false && this.storageProvider.id!=undefined){    // login status
            this.backgroundMode.enable(); 

        /////////////////////////////////////// 
        this.platform.pause.subscribe(()=>{
            console.log("pause event comes");
            this.storageProvider.backgroundMode=true;
        }); //How about reporting it to server?
        this.platform.resume.subscribe(()=>{
            console.log("resume event comes.send app:foreground");
            this.storageProvider.backgroundMode=false;
        }); //How about reporting it to server?
        this.backgroundMode.on("enable").subscribe(()=>{
            console.log("background mode has been activated");
            this.storageProvider.backgroundMode=true;
        });

        this.backgroundMode.on("deactivate").subscribe(()=> {
        console.log("background mode has been deactivated");
        this.storageProvider.backgroundMode=false;
        });

        this.backgroundMode.setDefaults({
            title:  '웨이티가 실행중입니다',
            ticker: '주문알림 대기',
            text:   '웨이티가 실행중입니다'
        });
        //////////////////////////////////////// 
            let ready = true;
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

                let view = this.navController.getActive(); // As none of the above have occurred, its either a page pushed from menu or tab
                let activeVC = this.navController.getActive(); //get the active view
            
                let page = activeVC.instance; //page is the current view's instance i.e the current component I suppose
                if(this.app.getRootNav().getActive()!=this.viewCtrl){                
                        if (this.navController.canGoBack() || view && view.isOverlay) {
                            this.navController.pop(); //pop if page can go back or if its an overlay over a menu page
                        }             
                        else {
                                console.log("No view in app. How can it happen?");
                                this.platform.exitApp();
                        }
                        return;
                }else{
                    console.log("Handling back button on  tabs page");
                            this.alertCtrl.create({
                                title: '앱을 종료하시겠습니까?',
                                message: '진행중인 주문에 대해 주문알림을 받지 못할수 있습니다.',
                                buttons: [
                                    {
                                        text: '아니오',
                                        handler: () => {
                                        }
                                    },
                                    {
                                        text: '네',
                                        handler: () => {
                                            
                                                this.cartProvider.db.close().then(()=>{
                                                    this.platform.exitApp();
                                                },(err)=>{
                                                    console.log("!!!fail to close db!!!");
                                                    this.platform.exitApp();
                                                });
                                                
                                        }
                                    }
                                ]
                            }).present();
                }
            }, 100/* high priority rather than login page */);
       }
  }

  ionViewWillUnload(){
    console.log("!!!ionViewWillUnload-tabs-tourMode:"+this.storageProvider.tourMode);
    if(this.storageProvider.tourMode==true){
        //drop table
        console.log("tourMode drop table this.storageProvider.db");
        this.cartProvider.dropCartInfo().then(()=>{
            this.cartProvider.db.close();    
        },()=>{
            this.cartProvider.db.close();
        });
    }else{
        if(this.cartProvider.db!=undefined){
            this.cartProvider.db.close().then(()=>{

            },(err)=>{
                console.log("!!!fail to close db!!!");
            });
        }
    }
    
  }

    registerPushService(){ // Please move this code into tabs.ts
            this.pushNotification=this.push.init({
                android: {
                    senderID: this.storageProvider.userSenderID,
                    sound: "true",
                   // clearBadge: "true"
                },
                ios: {
                    "fcmSandbox": "false", //code for production mode
                    //"fcmSandbox": "true",  //code for development mode
                    "alert": "true",
                    "sound": "true",
                    "badge": "true",
                   // "clearBadge": "true"
                },
                windows: {}
            });

            console.log("senderId:"+this.storageProvider.userSenderID);
                        
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

              let body = {registrationId:response.registrationId, platform: platform};

              console.log("server:"+ this.storageProvider.serverAddress +" body:"+JSON.stringify(body));
              this.serverProvider.post(this.storageProvider.serverAddress+"/registrationId",body).then((res:any)=>{
                  console.log("registrationId sent successfully");
                  var result:string=res.result;
                  if(result=="success"){

                  }else{
                    
                  }
             },(err)=>{
                 if(err=="NetworkFailure"){
                        console.log("registrationId sent failure");
                        //this.storageProvider.errorReasonSet('네트웍 연결이 원할하지 않습니다'); 
                        //Please move into ErrorPage!
                        this.app.getRootNav().setRoot(ErrorPage);
                 }else{
                     console.log("Hum...registrationId-HttpError");
                 } 
                });
            });

            this.pushNotification.on('notification').subscribe((data:any)=>{
/*                
//                  let custom = {"cashTuno":"20170103075617278","cashId":"TAKIT02","transactionType":"deposit","amount":1,"transactionTime":"20170103","confirm":0,"bankName":"농협은행"}
                  let custom ={"depositMemo":"타킷 주식회사","amount":"100003","depositDate":"2017-01-06","branchName":"본점영업부","cashTuno":"20170106093158510","bankName":"농협"}
                  let cashConfirmModal = this.modalCtrl.create(CashConfirmPage, { custom: custom });
                  cashConfirmModal.present();
*/
/*                 
                if(!this.storageProvider.isAndroid){
                    console.log("ios -- data.sound:"+data.sound);
                    var snd =  new MediaPlugin(data.sound);
                    snd.play();
                }
*/                
                console.log("[tabs.ts]pushNotification.on-data:"+JSON.stringify(data));
                console.log("[tabs.ts]pushNotification.on-data.title:"+JSON.stringify(data.title));
                
                var additionalData:any=data.additionalData;
                console.log("addiontalData.GCMType:"+additionalData.GCMType);
                //Please check if type of custom is object or string. I have no idea why this happens.
                if(additionalData.GCMType==="order"){
                    let orderId;
                    if(typeof additionalData.custom === 'string'){
                            orderId=JSON.parse(additionalData.custom).orderId;
                    }else{
                            orderId=additionalData.custom.orderId;
                    }
                    console.log("orderId:"+orderId);

                    if(typeof additionalData.custom === 'string'){ 
                        this.events.publish('orderUpdate',{order:JSON.parse(additionalData.custom)}); 
                    }else{ //object
                        this.events.publish('orderUpdate',{order:additionalData.custom});
                    }

                    if(!this.storageProvider.orderExistInProgress(orderId)){
                        console.log("!!! modal page??? ");
                        let orderDoneModal;
                        if(typeof additionalData.custom === 'string'){ 
                            let order = JSON.parse(additionalData.custom);
                            orderDoneModal= this.modalCtrl.create(OrderDetailPage, { order:order, trigger:"gcm" });
                        }else{ // object 
                            console.log("obj comes");
                            orderDoneModal= this.modalCtrl.create(OrderDetailPage, {  order:additionalData.custom, trigger:"gcm"});
                        }
                        orderDoneModal.present();
                    }
                }else if(additionalData.GCMType==="cash"){
                  console.log("cash-additionalData.custom:"+additionalData.custom);
                  if((!this.storageProvider.backgroundMode && this.platform.is("ios"))//ios resume event comes before notification.
                        ||(this.platform.is("android") && !this.storageProvider.cashExistInProgress(additionalData.custom))){ // android resume event comes late.
                        let cashConfirmModal;
                        if(typeof additionalData.custom === 'string'){ 
                            cashConfirmModal= this.modalCtrl.create(CashConfirmPage, { custom: JSON.parse(additionalData.custom) });
                        }else{ // object 
                            console.log("obj comes");
                            cashConfirmModal= this.modalCtrl.create(CashConfirmPage, { custom: additionalData.custom });
                        }
                        console.log("GCMCashUpdateEmitter");
                        cashConfirmModal.present();
                  }
                }
                if(additionalData.GCMType!=="cash" &&  additionalData.notId!=undefined && additionalData.GCMType!=="multiLogin"){
                        this.confirmMsgDelivery(additionalData.notId).then(()=>{
                            console.log("confirmMsgDelivery success");
                        },(err)=>{
                            if(err=="NetworkFailure"){
                                let alert = this.alertCtrl.create({
                                    title: "서버와 통신에 문제가 있습니다.",
                                    buttons: ['OK']
                                });
                                alert.present();
                            }else{
                                console.log("hum...successGCM-HttpFailure");
                            }
                        });
                }                
            });

            this.pushNotification.on('error').subscribe((e:any)=>{
                console.log(e.message);
            });
    }

    confirmMsgDelivery(messageId){
        return new Promise((resolve,reject)=>{
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            console.log("messageId:"+messageId);
            console.log("!!!server:"+ this.storageProvider.serverAddress);
            let body = {messageId:messageId};

            this.serverProvider.post(this.storageProvider.serverAddress+"/successGCM",body).then((res:any)=>{    
                  console.log("res:"+JSON.stringify(res));
                  resolve();
            },(err)=>{
                reject(err);  
            });
      });   
    }

 exitTour(){
    this.navController.pop();     
 }
  
}
