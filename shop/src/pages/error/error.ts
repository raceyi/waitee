import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,App,AlertController} from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import {StorageProvider} from '../../providers/storageProvider';
import {LoginPage} from '../login/login';
import {EmailProvider} from '../../providers/LoginProvider/email-provider';
import {PrinterProvider} from '../../providers/printerProvider';
import {ShopTablePage} from '../shoptable/shoptable';
import{SelectorPage} from '../selector/selector';


/**
 * Generated class for the ErrorPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-error',
  templateUrl: 'error.html',
})
export class ErrorPage {
  isAndroid;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public nativeStorage:NativeStorage,
              public storageProvider:StorageProvider,
              public app:App,
              public alertController:AlertController,
              private emailProvider:EmailProvider,
              private printerProvider:PrinterProvider,
              private platform: Platform) {
        this.isAndroid=platform.is("android");        
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ErrorPage');
    this.isAndroid=this.platform.is("android");        
  }

  exit(){
        console.log("terminate");
        this.platform.exitApp();
  }

  retry(){
            this.nativeStorage.getItem("id").then((value:string)=>{
                console.log("value:"+value);
                if(value==null){
                  console.log("id doesn't exist");
                  this.app.getRootNav().setRoot(LoginPage);
                  return;
                }
                console.log("decodeURI(value):"+decodeURI(value));
                var id=this.storageProvider.decryptValue("id",decodeURI(value));
                    this.nativeStorage.getItem("password").then((value:string)=>{
                        var password=this.storageProvider.decryptValue("password",decodeURI(value));
                        this.emailProvider.EmailServerLogin(id,password).then((res:any)=>{
                                console.log("MyApp:"+JSON.stringify(res));
                                if(res.result=="success"){
                                    //save shoplist
                                    this.shoplistHandler(res.shopUserInfo);
                                }else if(res.result=='invalidId'){
                                    //console.log("You have no right to access this app");
                                    let alert = this.alertController.create({
                                        subTitle: '사용자 정보에 문제가 발생했습니다. 로그인 페이지로 이동합니다.',
                                        buttons: ['OK']                                
                                      });
                                      alert.present();
                                    console.log("사용자 정보에 문제가 발생했습니다. 로그인 페이지로 이동합니다.");
                                    this.app.getRootNav().setRoot(LoginPage);
                                }else{
                                    //console.log("invalid result comes from server-"+JSON.stringify(res));
                                    //this.storageProvider.errorReasonSet('로그인 에러가 발생했습니다');
                                    let alert = this.alertController.create({
                                        subTitle: '로그인 에러가 발생했습니다',
                                        buttons: ['OK']                                
                                      });
                                      alert.present();
                                    console.log("로그인 에러가 발생했습니다"); 
                                }
                            },login_err =>{
                                //console.log(JSON.stringify(login_err));
                                //this.storageProvider.errorReasonSet('로그인 에러가 발생했습니다'); 
                        });
                    });
            },err=>{
                console.log("id doesn't exist. move into LoginPage");
                this.app.getRootNav().setRoot(LoginPage);
            });  }

///Humm... Please unify shoplistHandler in somewhre
    shoplistHandler(userinfo:any){
        console.log("myshoplist:"+userinfo.myShopList);
        if(!userinfo.hasOwnProperty("myShopList")|| userinfo.myShopList==null){
            //this.storageProvider.errorReasonSet('등록된 상점이 없습니다.');
            let alert = this.alertController.create({
                          subTitle: '등록된 상점이 없습니다.',
                          buttons: ['OK']                                
                        });
                        alert.present();
        }else{
             this.storageProvider.myshoplist=JSON.parse(userinfo.myShopList);
             this.storageProvider.userInfoSetFromServer(userinfo);
             if(this.storageProvider.myshoplist.length==1){
                console.log("move into ShopTablePage");
                this.storageProvider.myshop=this.storageProvider.myshoplist[0];
                this.app.getRootNav().setRoot(ShopTablePage);                
             }else{ 
                console.log("multiple shops");
                this.app.getRootNav().setRoot(SelectorPage);
             }
        }
        this.nativeStorage.getItem("printer").then((value:string)=>{
            let printer=JSON.parse(value);
            this.storageProvider.printerName=printer.name;
            this.printerProvider.setPrinter(printer);
            this.nativeStorage.getItem("printOn").then((value:string)=>{
                console.log("printOn:"+value);
                this.storageProvider.printOn= JSON.parse(value);
            },()=>{
                this.storageProvider.printOn=false;
            });
        },()=>{
            this.storageProvider.printOn=false;
        });
  }


}
