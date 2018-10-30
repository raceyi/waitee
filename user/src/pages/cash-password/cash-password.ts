import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController,Events,App,ViewController } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import {OrderDetailPage} from '../order-detail/order-detail';
import { TabsPage } from '../tabs/tabs';
import {CartProvider} from '../../providers/cart/cart';

/**
 * Generated class for the CashPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cash-password',
  templateUrl: 'cash-password.html',
})
export class CashPasswordPage {
  passwordInput=['',' ',' ',' ',' ',' '];
  password=[' ',' ',' ',' ',' ',' '];
  cursor:number=0;

  title:string;
  description:string;
  confirmInProgress=false;

  callback;

  body;
  trigger;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private alertController:AlertController,
              public serverProvider:ServerProvider,
              private cartProvider:CartProvider,
              private events:Events,
              private app:App,
              private storageProvider:StorageProvider) {
    this.body=navParams.get("body");
    this.trigger=navParams.get("trigger");

    this.callback = this.navParams.get("callback");                
    this.title=navParams.get("title");
    this.description=navParams.get("description");
}

  ionViewDidLoad() {
    console.log('ionViewDidLoad CashPasswordPage');
  }

  back(){
      this.navCtrl.pop();
  }

 buttonPressed(val:number){
        console.log("cursor:"+this.cursor+" val:"+val);
        if(val==-1 ){
            console.log("val is -1");
            this.cursor = (this.cursor>=1) ? (this.cursor-1 ): this.cursor;
            this.password[this.cursor]=' ';
            this.passwordInput[this.cursor]=' ';
        }else if(val==-10){
            console.log("val is -10");
            for(var i=0;i<6;i++){
                this.password[i]=' ';
                this.passwordInput[i]=' ';
            }
            this.cursor = 0;
        }else if(this.cursor<6){
            if(this.cursor!=0){
              this.password[this.cursor-1]='*';
            }
            if(this.cursor==5){
                this.passwordInput[this.cursor]=val.toString();  
                this.password[this.cursor++]='*';
            }else{
                this.passwordInput[this.cursor]=val.toString();  
                this.password[this.cursor++]=val.toString();
            }
            console.log("this.password:"+this.password);
        }
        if(this.cursor==6){
              this.confirm();
        }
  }
  
  confirm(){
    console.log("confirm");
    if(this.callback){
        for(let i=0;i<6;i++){
            if(this.passwordInput[i]==' '){
                let alert = this.alertController.create({
                        title: '비밀번호 6자리를 입력해주시기바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
                    this.confirmInProgress=false;
                    return;        
            }
        }
        var cashPassword="";
        cashPassword=cashPassword.concat(this.passwordInput[0],this.passwordInput[1],this.passwordInput[2],
                    this.passwordInput[3],this.passwordInput[4],this.passwordInput[5]);
        this.callback(cashPassword).then(()=>{
            this.navCtrl.pop();
        });
        return;
    }else{
        if(!this.confirmInProgress){
            this.confirmInProgress=true;

            for(let i=0;i<6;i++){
                if(this.passwordInput[i]==' '){
                    let alert = this.alertController.create({
                            title: '비밀번호를 입력해주시기바랍니다.',
                            buttons: ['OK']
                        });
                        alert.present();
                        this.confirmInProgress=false;
                        return;        
                }
            }
            let cashPassword="";
            cashPassword=cashPassword.concat(this.passwordInput[0],this.passwordInput[1],this.passwordInput[2],
                                this.passwordInput[3],this.passwordInput[4],this.passwordInput[5]);

            console.log("passwordInput:");
            for(let i=0;i<6;i++){
                console.log(this.passwordInput[i]);
            }

            this.body.password=cashPassword;
            this.body.orderedTime=new Date().toISOString();
            this.body.cashId= this.storageProvider.cashId;
            
            console.log("body:"+JSON.stringify(this.body));
            this.serverProvider.saveOrderCart(this.body).then((res:any)=>{    
                        //console.log(JSON.stringify(res)); 
                        let result:string=res.result;
                        if(result=="success"){
                            console.log("this.trigger:"+this.trigger);
                            if(this.trigger=="cart"){
                                    console.log("trigger is cart. call deleteAll");
                                    this.cartProvider.deleteAll().then(()=>{
                                        
                                    },()=>{
                                            //move into shophome
                                            let alert = this.alertController.create({
                                                    title: '장바구니 정보 업데이트에 실패했습니다',
                                                    buttons: ['OK']
                                                });
                                                alert.present();
                                    });
                            }else{  //trigger from shop page
                                if(res.order.stampUsageCount!=null && res.order.stampUsageCount>0){
                                    //update shop coupon stamp coupon Count
                                    this.serverProvider.getCurrentShopStampInfo();
                                }
                            }
                            console.log("send orderUpdate");
                            this.events.publish('orderUpdate',{order:res.order});
                            this.events.publish("cashUpdate");
                            //임시로 shopEnter로 구현하였다. 서버에서 최근 주문 음식점을 관리하도록 한다.   
                            console.log("body:"+JSON.stringify(this.body));                        
                            let carts=JSON.parse(this.body.orderList);
                            let shops=[];
                            carts.forEach(cart=>{
                                shops.push({ takitId:cart.takitId ,imagePath:cart.takitId+"_main", 
                                             deliveryArea: cart.deliveryArea,paymethod:cart.paymethod})
                            })
                            console.log("shops:"+JSON.stringify(shops));
                            this.storageProvider.updateShopList(shops);

                            let body = {shopList:JSON.stringify(this.storageProvider.shopList)};
                            console.log("!!shopEnter-body:",body);

                            if(this.storageProvider.tourMode==false){    
                                this.serverProvider.post(this.storageProvider.serverAddress+"/shopEnter",body).then((res:any)=>{
                                    console.log("res.result:"+res.result);
                                    var result:string=res.result;
                                    if(result=="success"){

                                    }else{
                                        
                                    }
                                },(err)=>{
                                    console.log("shopEnter-http post err "+err);
                                    //Please give user an alert!
                                    if(err=="NetworkFailure"){
                                    let alert = this.alertController.create({
                                            title: '서버와 통신에 문제가 있습니다',
                                            subTitle: '최근 주문 음식점이 서버에 반영되지 않았습니다.',
                                            buttons: ['OK']
                                        });
                                        alert.present();
                                    }
                                });
                            }
                            /////////////////////////////////////////////////////////////////////////////
                            if(res.order.length==1){
                                    let order=res.order[0].order;
                                    this.navCtrl.push(OrderDetailPage,{order:order,trigger:"order",class:"OrderDetailPage"});
                            }else{
                                this.storageProvider.tabs.select(2); // It doesn't work. Why?
                                let  views:ViewController[]; 
                                    views=this.navCtrl.getViews();
                                    this.navCtrl.remove(1,views.length-2);
                                    this.navCtrl.pop();
                                    
                                let alert = this.alertController.create({
                                        title: '주문 목록에서 주문상세 정보를 확인하실수 있습니다.',
                                        buttons: ['OK']
                                    });
                                    alert.present();                                
                            }
                            this.confirmInProgress=false;
                        }else{
                            let alert = this.alertController.create({
                                title: '주문에 실패하였습니다.',
                                subTitle: '다시 주문해주시기 바랍니다.',
                                buttons: ['OK']

                            });
                            alert.present();
                            this.navCtrl.pop();
                            //this.app.getRootNav().pop();
                            this.confirmInProgress=false;
                        }
                },(error)=>{
                        console.log("saveOrder err "+error);
                        if(error=="NetworkFailure"){
                            let alert = this.alertController.create({
                                    title: '서버와 통신에 문제가 있습니다',
                                    subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                    buttons: ['OK']
                                });
                                alert.present();
                        }else if(error=="soldout"){
                            let alert = this.alertController.create({
                                    title: '판매 종료 메뉴가 포함되어 있습니다.',
                                    buttons: ['OK']
                                });
                                alert.present();
                        }else if(error.startsWith("shop's off")){
                            let msg;
                            if(error.substr(10).length>2){
                                msg='상점의 주문시간'+ error.substr(10) +'을 확인해주시기 바랍니다.';
                            }else{
                                msg='상점의 주문시간을 확인해주시기 바랍니다.';
                            }
                            let alert = this.alertController.create({
                                    title: '지금은 주문을 할 수 없습니다.',
                                    subTitle:msg,
                                    buttons: ['OK']
                                });
                                alert.present();
                        }else if(error.startsWith("shop's closed")){
                            let alert = this.alertController.create({
                                    title: '상점문이 닫혔습니다',
                                    subTitle:'상점주께 상점문을 열어달라고 요청해주세요.',
                                    buttons: ['OK']
                                });
                                alert.present();
                        }else if(error=="invalidPrice"|| error=="invalidOption" || error=="invalidTimeContraint"){
                            let alert = this.alertController.create({
                                    title: '메뉴정보가 변경되었습니다.',
                                    subTitle:'상점에 다시 입장하여 새로운 메뉴정보로 주문해주세요',
                                    buttons: ['OK']
                                });
                                alert.present();
                        }else if(error=="invalidTimeContraint"){
                            let alert = this.alertController.create({
                                    title: '현재 시간에 주문불가능한 메뉴가 포함되어 있습니다.',
                                    buttons: ['OK']
                                });
                                alert.present();
                        }else if(error=="break time"){
                            let alert = this.alertController.create({
                                    title: '지금은 브레이크타임 입니다.',
                                    buttons: ['OK']
                                });
                                alert.present();
                        }else if(error=="last order end"){
                            let alert = this.alertController.create({
                                    title: '주문 가능 시간이 아닙니다.',
                                    buttons: ['OK']
                                });
                                alert.present();
                        }else if(error=="invalid cash password"){
                            let alert = this.alertController.create({
                                    title: '비밀번호가 일치하지 않습니다.',
                                    buttons: ['OK']
                                });
                                alert.present();
                        }else if(error=='card failure'){
                            let alert = this.alertController.create({
                                    title: '카드결제에 실패하였습니다.',
                                    buttons: ['OK']
                                });
                                alert.present();
                        }else if(error.startsWith("check your balance")){
                            this.serverProvider.checkTossExistence().then(()=>{
                                this.serverProvider.updateCash().then(()=>{   // 버전 다시 만들때는 반듯이 updateCash를 다시 불러주자. !!! 서버에서 응답값으로 변경 값을 보내주도록 하자. !!!
                                    let amount=this.body.total-this.storageProvider.cashAmount;
                                    console.log("....amount:"+amount);
                                    if(amount>0){
                                        let alert = this.alertController.create({
                                                title:'캐시 잔액이 부족합니다.',
                                                subTitle: amount+'원을 토스로 충전합니다.',
                                                buttons: [
                                                            {
                                                                text: 'Toss로 입금',
                                                                cssClass: 'toss-alert-button',                                                                handler: () => {
                                                                    console.log('launch toss');
                                                                    this.serverProvider.launchToss(amount);
                                                                }
                                                            },
                                                            {
                                                                text: '아니오',
                                                                handler: () => {
                                                                    //do nothing
                                                                }
                                                            }    
                                                        ]
                                            });
                                            alert.present();
                                    }else{
                                        let alert = this.alertController.create({
                                                title: '잔액이 부족합니다.',
                                                buttons: ['OK']
                                            });
                                            alert.present();
                                    }
                                },err=>{
                                        let alert = this.alertController.create({
                                                title: '잔액이 부족합니다.',
                                                buttons: ['OK']
                                            });
                                            alert.present();
                                })
                            },err=>{
                                    let alert = this.alertController.create({
                                            title: '잔액이 부족합니다.',
                                            buttons: ['OK']
                                        });
                                        alert.present();
                            })
                        }else if(error=="menuWithTimeConstraint"){
                            let alert = this.alertController.create({
                                    title: '주문시간이 아닌 메뉴가 포함되어 있습니다.',
                                    buttons: ['OK']
                                });
                                alert.present();                            
                        }else if(error=="duplicate order"){
                            let alert = this.alertController.create({
                                    title: '고객님 5초내의 중복 주문이 존재합니다.',
                                    buttons: ['OK']
                                });
                                alert.present();                            
                        }else{
                            let alert = this.alertController.create({
                                    title: '주문에 실패했습니다.',
                                    buttons: ['OK']
                                });
                                alert.present();                     
                        }
                        this.navCtrl.pop();
                        this.confirmInProgress=false;
                })      
            }
    }    
  }
}
