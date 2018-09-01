import { HttpClient ,HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {StorageProvider} from '../storage/storage';
import {LoginProvider} from '../login/login';
import { NativeStorage } from '@ionic-native/native-storage';
import { HTTP } from '@ionic-native/http';
import { NavController,Platform,AlertController,LoadingController} from 'ionic-angular';
import { CartProvider } from '../../providers/cart/cart';
import { WebIntent } from '@ionic-native/web-intent';

/*
  Generated class for the ServerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ServerProvider {

  constructor(public http: HTTP,
              public httpClient:HttpClient,
              public storage:StorageProvider,
              public cartProvider:CartProvider,
              private nativeStorage: NativeStorage,
              public loadingCtrl: LoadingController,              
              private platform:Platform,
              public login:LoginProvider,
              private webIntent:WebIntent) {
    console.log('Hello ServerProvider Provider');
  }

  post(reqUrl,body){
    return new Promise((resolve, reject)=>{
            body.version=this.storage.version;
            console.log("body:"+JSON.stringify(body));

           if(this.platform.is("cordova")){
                let url=this.storage.serverAddress+reqUrl;
                this.http.post(url,body, {"Content-Type":"application/json"}).then((res:any)=>{
                        console.log("res:"+JSON.stringify(res));
                        resolve(JSON.parse(res.data));
                },(err)=>{
                        console.log("post error "+JSON.stringify(err));
                        if(err.hasOwnProperty("status") && err.status==401){  // 맞는지 확인이 필요하다... native plugin 일경우 확인하자!!!
                            this.loginAgain().then(()=>{
                                //call http post again
                                this.http.post(url,body,{"Content-Type":"application/json"}).then((res)=>{
                                    resolve(JSON.parse(res.data));  
                                },(err)=>{
                                    reject("NetworkFailure");
                                });
                            });
                        }else
                            reject("post no response");
                    });
           }else{ // ionic serve
                let url="http://localhost:8100"+reqUrl;
                this.httpClient.post(url,body).subscribe((res:any)=>{
                        //console.log("res:"+JSON.stringify(res));
                        resolve(res);
                },(err)=>{
                        console.log("post error "+JSON.stringify(err));
                        if(err.hasOwnProperty("status") && err.status==401){  // 맞는지 확인이 필요하다... native plugin 일경우 확인하자!!!
                            this.loginAgain().then(()=>{
                                //call http post again
                                this.httpClient.post(url,body).subscribe((res)=>{
                                    resolve(res);  
                                },(err)=>{
                                    reject("NetworkFailure");
                                });
                            });
                        }else
                            reject("post no response");
                    });
           }
      });    
  }


  loginAgain(){
      return new Promise((resolve,reject)=>{
        console.log("[loginAgain] id:"+this.storage.id);
                    this.nativeStorage.getItem("password").then((value:string)=>{
                        var password=this.storage.decryptValue("password",decodeURI(value));
                        this.login.EmailServerLogin(this.storage.id,password).then((res:any)=>{
                                console.log("MyApp:"+JSON.stringify(res));
                                if(res.result=="success"){
                                    if(res.version!=this.storage.version){
                                        console.log("post invalid version");
                                    }
                                    resolve();
                                }else
                                    reject("HttpFailure");
                            },login_err =>{
                                    reject("NetworkFailure");
                        });
                    });
        });
  }

  saveOrder(takeout,notiPhone,paymentType,cardResult,
            receitIssue,receiptId,receiptType){
      return new Promise((resolve,reject)=>{
            let body:any;
            console.log("shop.shopInfo "+JSON.stringify(this.storage.shop.shopInfo));
            let output=this.smartroResultParser(JSON.parse(cardResult));
            body={ takitId: this.storage.takitId,
                    orderName:this.cartProvider.orderName,
                    amount: this.cartProvider.totalAmount,
                    takeout: takeout,
                    notiPhone:notiPhone,
                    orderList:this.cartProvider.orderList,
                    paymentType:paymentType,
                    shopName:this.storage.shop.shopInfo.shopName,
                    address:this.storage.shop.shopInfo.address,
                    businessNumber:this.storage.shop.shopInfo.businessNumber
                };

            if(paymentType=="cash"){
                body.receiptIssue=receitIssue;
                body.receiptId=receiptId;
                body.receiptType=receiptType;
            }else if(paymentType="card"){
                body.cardPayment=cardResult;
                body.approvalNO=output.approvalNO;
                body.approvalDate=output.approvalTime.substr(0,8);
                body.catid=this.storage.catid;
                body.cardNO=output.cardNO;
                body.cardName=output.cardName;
            }
            console.log("saveOrder body:"+JSON.stringify(body));
            this.post("/kiosk/saveOrder",body).then(res=>{
                resolve(res); //orderNO를 받아 보여준다.
            },err=>{
                reject(err);
            })
      });
  }

  smartroResultParser(result){
      console.log("smartroResultParser:"+JSON.stringify(result));
       let output={
            shopName:result.extras.shopName,
            address:result.extras.shopAddress,

            approvalTime: result.extras.approvaldate, // 2018 08 25 19 24 50

            cardNO:result.extras.cardno,
            cardName: result.extras.issuername,
            approvalNO: result.extras.approvalno,
            amount: result.extras.totalamount
            };
        return output;            
  }


  smartroCancelPayment(amount,approvalNO,approvalTime){
      return new Promise((resolve,reject)=>{
            let approvalDate=approvalTime.substr(0,8);
            console.log("approvalDate:"+approvalDate);

            let businessno="7721300255";
            let catid="7098349001";
             let tmpVal="smartroapp://freepaylink?mode=normal&trantype=card_cancel&amount="+amount+"&totalamount="+amount+"&authedno="+approvalNO+"&autheddate="+approvalDate+"&businessno="+businessno+"&catid="+catid+"&receiptmode=2&dongletype=5";
           // let tmpVal="smartroapp://freepaylink?mode=normal&trantype=card_cancel&amount="+amount+"&totalamount="+amount+"&authedno="+approvalNO+"&autheddate="+approvalDate+"&businessno="+this.storage.shop.shopInfo.businessNumber+"&catid="+this.storage.catid+"&receiptmode=2&dongletype=5";

            let loading = this.loadingCtrl.create({
            content: '결제 취소 준비중입니다.'
            });
            loading.present();

            this.webIntent.startActivityForResult({ action: this.webIntent.ACTION_VIEW, url: tmpVal }).then((res:any)=>{ 
                loading.dismiss();
                console.log('smartroCancelPayment:'+JSON.stringify(res));
                console.log("res.extras:"+JSON.stringify(res.extras));
                if(res.extras.resultval==0){ 
                        resolve();
                }else{
                        reject();
                }
            }, function(err){
                    loading.dismiss();
                    reject();
            })
      });
  }


}
