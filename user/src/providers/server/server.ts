import { HttpClient } from '@angular/common/http';
import { Injectable ,NgZone} from '@angular/core';
import {StorageProvider} from '../storage/storage';
import {AlertController,Events,Platform} from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import {LoginProvider} from '../../providers/login/login';
import {TimeUtil} from '../../classes/TimeUtil';
import { InAppBrowser,InAppBrowserEvent } from '@ionic-native/in-app-browser';

/*
  Generated class for the ServerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ServerProvider {
  timeUtil= new TimeUtil(); 
  browserRef;

    constructor(public http: HttpClient
                ,private storageProvider:StorageProvider
                ,private nativeStorage: NativeStorage
                ,public alertCtrl:AlertController
                ,public loginProvider:LoginProvider
                ,private events:Events
                ,private iab: InAppBrowser
                ,private ngZone:NgZone
                ,private platform:Platform) {
      console.log('Hello ServerProvider Provider');
    }

    postAnonymous(request,bodyIn){
       console.log("!!!!post:"+bodyIn);
       let bodyObj=bodyIn;
       bodyObj.version=this.storageProvider.version;
       let body=bodyObj;
       console.log("request:"+request);

       return new Promise((resolve,reject)=>{
            this.http.post(request,body).subscribe((res:any)=>{               
                console.log("post version:"+res.version+" version:"+this.storageProvider.version);
                resolve(res);                    
            },(err)=>{
                console.log("post-err:"+JSON.stringify(err));
                reject(err);
            });
       });
    }

  post(request,bodyIn){
       console.log("!!!!post:"+bodyIn);
       let bodyObj=bodyIn;
       bodyObj.version=this.storageProvider.version;
       console.log("request:"+request);

       return new Promise((resolve,reject)=>{
            this.http.post(request,bodyObj).subscribe((res:any)=>{               
                console.log("post version:"+res.version+" version:"+this.storageProvider.version);
                resolve(res);                    
            },(err)=>{
                console.log("post-err:"+JSON.stringify(err));
                if(err.hasOwnProperty("status") && err.status==401){
                    //login again with id
                    this.loginAgain().then(()=>{
                        //call http post again
                        this.http.post(request,bodyObj).subscribe((res:any)=>{
                            console.log("post version:"+res.version+" version:"+this.storageProvider.version);
                            if(parseFloat(res.version)>parseFloat(this.storageProvider.version)){
                                console.log("post invalid version");
                                let alert = this.alertCtrl.create({
                                            title: '앱버전을 업데이트해주시기 바랍니다.',
                                            subTitle: '현재버전에서는 일부 기능이 정상동작하지 않을수 있습니다.',
                                            buttons: ['OK']
                                        });
                                alert.present();
                            }
                            resolve(res.json());  
                         },(err)=>{
                             reject("NetworkFailure");
                         });
                    },(err)=>{
                        reject(err);
                    });
                }else{
                    reject("NetworkFailure");
                }
            });
       });
  }

loginAgain(){
      return new Promise((resolve,reject)=>{
        console.log("[loginAgain] id:"+this.storageProvider.id);
                if(this.storageProvider.id=="facebook" || this.storageProvider.id=="kakao"){
                    this.loginProvider.loginSocialLogin(this.storageProvider.id).then((res:any)=>{
                                if(res.result=="success"){
                                    if(parseFloat(res.version)>parseFloat(this.storageProvider.version)){
                                        console.log("post invalid version");
                                        let alert = this.alertCtrl.create({
                                                    title: '앱버전을 업데이트해주시기 바랍니다.',
                                                    subTitle: '현재버전에서는 일부 기능이 정상동작하지 않을수 있습니다.',
                                                    buttons: ['OK']
                                                });
                                        alert.present();
                                    }
                                    resolve();
                                }else
                                    reject("HttpFailure");
                            },login_err =>{
                                reject("NetworkFailure");
                    });
                }else{ // email login 
                    this.nativeStorage.getItem("password").then((value:string)=>{
                        var password=this.storageProvider.decryptValue("password",decodeURI(value));
                        this.loginProvider.loginEmail(this.storageProvider.id,password).then((res:any)=>{
                                console.log("MyApp:"+JSON.stringify(res));
                                if(res.result=="success"){
                                    if(parseFloat(res.version)>parseFloat(this.storageProvider.version)){
                                        let alert = this.alertCtrl.create({
                                                    title: '앱버전을 업데이트해주시기 바랍니다.',
                                                    subTitle: '현재버전에서는 일부 기능이 정상동작하지 않을수 있습니다.',
                                                    buttons: ['OK']
                                                });
                                        alert.present();
                                    }
                                    resolve();
                                }else
                                    reject("HttpFailure");
                            },login_err =>{
                                    reject("NetworkFailure");
                        });
                    });
                }
        });
  }

  saveOrder(body){
      return new Promise((resolve,reject)=>{
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            console.log("saveOrder:"+JSON.stringify(body));
            this.post(encodeURI(this.storageProvider.serverAddress+"/saveOrder"),body).then((res:any)=>{
                  console.log("res:"+JSON.stringify(res));
                  console.log("saveOrder-res.result:"+res.result);
                  if(res.result=="success"){
                    //resolve(res.orders);
                    resolve(res);
                  }else{
                    reject(res.error);
                  }
            },(err)=>{
                reject(err);  
            });
            this.nativeStorage.setItem("orderDoneFlag","true");
      });
  }

saveOrderCart(body){
      return new Promise((resolve,reject)=>{
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            console.log("saveOrder:"+JSON.stringify(body));
            this.post(encodeURI(this.storageProvider.serverAddress+"/saveOrderCart"),body).then((res:any)=>{
                  console.log("res:"+JSON.stringify(res));
                  console.log("saveOrder-res.result:"+res.result);
                  if(res.result=="success"){
                    //resolve(res.orders);
                    resolve(res);
                  }else{
                    reject(res.error);
                  }
            },(err)=>{
                reject(err);  
            });
      });
  }

  cancelOrder(order){
    return new Promise((resolve,reject)=>{
    let confirm = this.alertCtrl.create({
                title: '주문을 취소하시겠습니까?',
                buttons: [{
                            text: '아니오',
                            handler: () => {
                              console.log('Disagree clicked');
                            }
                          },
                          {
                            text: '네',
                            handler: () => {
                                    console.log("server:"+ this.storageProvider.serverAddress);
                                    let body  = { orderId:order.orderId,
                                                                cancelReason:"고객주문취소",
                                                                cashId:this.storageProvider.cashId};
                                    
                                    this.post(this.storageProvider.serverAddress+"/cancelOrderCart",body).then((res:any)=>{
                                        console.log("cancelOrder-res:"+JSON.stringify(res));
                                        var result:string=res.result;
                                        if(result==="success"){
                                            let alert = this.alertCtrl.create({
                                                title: '주문 취소가 정상 처리 되었습니다.',
                                                buttons: ['확인']
                                            });
                                            alert.present();
                                        //update order status
                                            this.ngZone.run(()=>{
                                                        order.orderStatus="cancelled";  
                                                        order.cancelReason="고객주문취소";
                                                        if(res.order.hasOwnProperty("cancelledTime")){   
                                                            console.log("cancelledTime:"+res.order.cancelledTime);                   
                                                            order.localCancelledTimeString=this.timeUtil.getlocalTimeString(res.order.cancelledTime);
                                                        }
                                            });
                                            this.events.publish("orderUpdate",{order:res.order});
                                            this.events.publish("cashUpdate");
                                            resolve(res.order);
                                        }else{
                                            //Please give user a notification
                                            let alert;
                                            let reason:string=res.reason;
                                            if(reason=="card-cancel failure"){
                                                    alert = this.alertCtrl.create({
                                                        title: '주문 상태는 변경되었으나 카드 결제 취소에 실패했습니다.',
                                                        subTitle: '고객센터(0505-170-3636,help@takit.biz)에 연락바랍니다.',
                                                        buttons: ['OK']
                                                    });
                                            }else{
                                                    alert = this.alertCtrl.create({
                                                        title: '주문취소에 실패했습니다.',
                                                        subTitle: '주문 상태를 확인해 주시기바랍니다',
                                                        buttons: ['OK']
                                                    });
                                            }
                                            alert.present();
                                            reject();
                                        }
                                    },(err)=>{
                                    let alert = this.alertCtrl.create({
                                            title: '서버와 통신에 문제가 있습니다',
                                            subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                            buttons: ['OK']
                                        });
                                        alert.present();
                                        reject();
                                    });
                            }
                      }]});
        confirm.present();  
    });  
  }        

    getShopInfo(takitId){
        return new Promise((resolve,reject)=>{
            console.log("takitId:"+takitId);
            this.post(this.storageProvider.serverAddress+"/cafe/shopHome",{takitId:takitId}).then((res)=>{
                //console.log("res:"+JSON.stringify(res));
                resolve(res);
            },(err)=>{
                reject("http error");  
            });
        });   
    }

    mobileAuth(){
      console.log("mobileAuth");
    return new Promise((resolve,reject)=>{
      // move into CertPage and then 
      if(this.platform.is("android")){
            this.browserRef=this.iab.create(this.storageProvider.certUrl,"_blank" ,'toolbar=no');
      }else{ // ios
            console.log("ios");
            this.browserRef=this.iab.create(this.storageProvider.certUrl,"_blank" ,'location=no,closebuttoncaption=종료');
      }
              this.browserRef.on("exit").subscribe((event)=>{
                  console.log("InAppBrowserEvent(exit):"+JSON.stringify(event)); 
                  this.browserRef.close();
              });
              this.browserRef.on("loadstart").subscribe((event:InAppBrowserEvent)=>{
                  console.log("InAppBrowserEvent(loadstart):"+String(event.url));
                  if(event.url.startsWith("https://takit.biz/oauthSuccess")){ // Just testing. Please add success and failure into server 
                        console.log("cert success");
                        var strs=event.url.split("userPhone=");    
                        if(strs.length>=2){
                            var nameStrs=strs[1].split("userName=");
                            if(nameStrs.length>=2){
                                var userPhone=nameStrs[0];
                                var userSexStrs=nameStrs[1].split("userSex=");
                                var userName=userSexStrs[0];
                                var userAgeStrs=userSexStrs[1].split("userAge=");
                                var userSex=userAgeStrs[0];
                                var userAge=userAgeStrs[1];
                                console.log("userPhone:"+userPhone+" userName:"+userName+" userSex:"+userSex+" userAge:"+userAge);
                                let body = {userPhone:userPhone,userName:userName,userSex:userSex,userAge:userAge};
                                this.post(this.storageProvider.serverAddress+"/getUserInfo",body).then((res:any)=>{
                                    console.log("/getUserInfo res:"+JSON.stringify(res));
                                    if(res.result=="success"){
                                        resolve(res);
                                    }else{
                                        // change user info
                                        //    
                                        reject("invalidUserInfo");
                                    }
                                },(err)=>{
                                    if(err=="NetworkFailure"){
                                            let alert = this.alertCtrl.create({
                                                subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                                buttons: ['OK']
                                            });
                                            alert.present();
                                    }
                                    reject(err);
                                });
                            } 
                            ///////////////////////////////
                        }
                        this.browserRef.close();
                        return;
                  }else if(event.url.startsWith("https://takit.biz/oauthFailure")){
                        console.log("cert failure");
                        this.browserRef.close();
                         reject();
                        return;
                  }
              });
    });
  }

  shopListUpdate(){ // workaround code for old users. 고객이 모두 새로운 앱(waitee)으로 전환된 이후에는 삭제해도 되는 코드임.
        if(this.storageProvider.shopList.length>0 &&  !this.storageProvider.shopList[0].hasOwnProperty("imagePath")){
            this.storageProvider.shopList=[];
            let body = {shopList:JSON.stringify(this.storageProvider.shopList)};
            console.log("!!shopEnter-body:",body);

            if(this.storageProvider.tourMode==false){    
                this.post(this.storageProvider.serverAddress+"/shopEnter",body).then((res:any)=>{
                    console.log("res.result:"+res.result);
                    var result:string=res.result;
                    if(result=="success"){

                    }else{
                        
                    }
                },(err)=>{
                    console.log("shopEnter-http post err "+err);
                    if(err=="NetworkFailure"){
                        //handle it later.
                    }
                });
            }            
        }    
  }
}
