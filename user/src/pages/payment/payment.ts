import { Component,NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController} from 'ionic-angular';
import {OrderDetailPage} from '../order-detail/order-detail';
import {CashChargePage} from '../cash-charge/cash-charge';
import {StorageProvider} from '../../providers/storage/storage';
import { CardProvider } from '../../providers/card/card';
import {ServerProvider} from '../../providers/server/server';
import {CashPasswordPage} from '../cash-password/cash-password';

/**
 * Generated class for the PaymentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html',
})
export class PaymentPage {
  inStoreColor="#6441a5";
  takeoutColor="#bdbdbd";
  deliveryColor="#bdbdbd";

  cardAvailable:boolean=false;

  deliveryAvailable:boolean=false;  ///////동일 매장에서만 배송이 가능합니다.
  takeoutAvailable:boolean=false;   ////// 일부 메뉴 포장시 따로 주문결제를 수행해 주시기 바랍니다. 

  deliveryFee;

  paymentSelection="cash";

  cardIndex=-1;
  currentCashClasses={
    'cash-card':true,  
    'card-unselect-border':false,
    'scroll-col-latest':false,
    'cash-select-border':true,
    'select-scroll-col-latest':true
  };

  currentCardClassesArray=[];

  carts;
  orderName;

  cardDiscount;
  cashDiscount;

  totalAmount:number=0;
  payAmount:number=0;

  takeout=0; //takeout:1 , takeout:2(delivery)
  deliveryAddress;

  trigger;
  constructor(public navCtrl: NavController, 
              private ngZone:NgZone,
              public navParams: NavParams,
              private cardProvider: CardProvider,
              private alertController:AlertController,              
              public storageProvider:StorageProvider,
              public serverProvider:ServerProvider) {

    let param=JSON.parse(navParams.get('order'));
    console.log("param:"+JSON.stringify(param));
    this.carts=param.carts;
    this.orderName=JSON.stringify(param.orderName);
    this.trigger=param.trigger;

    this.checkTakeoutAvailable();
    this.checkDeliveryAvailable();

    this.storageProvider.payInfo.forEach(payment=>{
        this.currentCardClassesArray.push({
            'card-card':true,
            'scroll-col-latest':true,
            'card-unselect-border':true,
            'select-scroll-col-latest':false,
            'card-select-border':false
        });
    });

    //request the recent discount rate for each cart
    let shops=[];
    this.carts.forEach(cart => { 
      this.totalAmount+=cart.price; 
      shops.push(cart.takitId)
    });

    this.cardAvailable=true;
    for(var j=0;j<this.carts.length;j++){
        if(!this.carts[j].paymethod.hasOwnProperty('card')){
            this.cardAvailable=false;
        }
    }
    this.computePayAmount();

    if(this.carts[0].freeDelivery!=undefined &&
       this.carts[0].freeDelivery!=null &&
       this.payAmount<this.carts[0].freeDelivery){
          // 배달료 추가됨.
          this.deliveryFee=this.carts[0].deliveryFee;
    }

    let body = {shops:JSON.stringify(shops)};
        this.serverProvider.post(this.storageProvider.serverAddress+"/getPayMethod",body).then((res:any)=>{
            console.log("getPayMethod-res:"+JSON.stringify(res));
            if(res.result=="success"){
                console.log("res.payMethod:"+res.payMethods);
                let cardAvailable=true;
                this.carts.forEach(cart => { 
                    for(var j=0;j<res.payMethods.length;j++){
                        if(res.payMethods[j].takitId==cart.takitId){
                            cart.paymethod=JSON.parse(res.payMethods[j].paymethod);
                            console.log("cart.paymethod:"+JSON.stringify(cart.paymethod));
                            if(cart.paymethod.card==undefined)
                                cardAvailable=false;
                        }
                    }
                });
                this.ngZone.run(()=>{
                    this.cardAvailable=cardAvailable;                  
                    this.computePayAmount();
                });
            }else{
                console.log("couldn't get discount rate of due to unknwn reason");
            }
        },(err)=>{
                if(err=="NetworkFailure"){
                            let alert = this.alertController.create({
                                title: "서버와 통신에 문제가 있습니다.",
                                buttons: ['OK']
                            });
                            alert.present();
                 }else{
                     console.log("Hum...getPayMethod-HttpError");
                 }
        })        
  }

 computePayAmount(){
    this.cardDiscount=0;
    this.cashDiscount=0;
    for(var i=0;i<this.carts.length;i++){ 
                let cardRate:string=this.carts[i].paymethod.card;
                let cashRate:string=this.carts[i].paymethod.cash;
                if(cardRate!=undefined){
                    let cardDiscount:number=parseFloat(cardRate.substr(0,cardRate.length-1));
                    this.cardDiscount+= (this.carts[i].price*cardDiscount)/100;
                }
                if(cashRate!=undefined){
                    let cashDiscount:number=parseFloat(cashRate.substr(0,cashRate.length-1));
                    this.cashDiscount+= (this.carts[i].price*cashDiscount)/100;
                }
                console.log("this.cardDiscount: "+this.cardDiscount+ "this.cashDiscount:"+this.cashDiscount)
    }

    if(this.paymentSelection=="cash")
        this.payAmount=this.totalAmount-this.cashDiscount;
    else
        this.payAmount=this.totalAmount-this.cardDiscount;

    if(this.takeout==2 && this.payAmount<this.carts[0].freeDelivery){
        this.payAmount+=parseInt(this.deliveryFee);
    }    
  }

  checkTakeoutAvailable(){
    for(var i=0;i<this.carts.length;i++){
      for(var j=0;j<this.carts[i].menus.length;j++){
        if(this.carts[i].menus[j].takeout<1){
            this.takeoutAvailable=false;
            return;
        }
      }
    }
    this.takeoutAvailable=true;
  }

  checkDeliveryAvailable(){
    // 하나의 상점 주문에서만 배송 가능
    if(this.carts.length>1){
        this.deliveryAvailable=false;
        return;
    }
    for(var j=0;j<this.carts[0].menus.length;j++)
    if(this.carts[0].menus[j].takeout<2){
        this.deliveryAvailable=false;
        return;
    }
    this.deliveryAvailable=true;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PaymentPage');
  }

  selectInStore(){
      this.inStoreColor="#6441a5";
      this.takeoutColor="#bdbdbd";
      this.deliveryColor="#bdbdbd";
      this.takeout=0; //takeout:1 , takeout:2(delivery)
      this.computePayAmount();
  }

  selectTakeOut(){
      this.inStoreColor="#bdbdbd";
      this.takeoutColor="#6441a5";
      this.deliveryColor="#bdbdbd";
      this.takeout=1; //takeout:1 , takeout:2(delivery)
      this.computePayAmount();      
  }

  selectDelivery(){
      this.inStoreColor="#bdbdbd";
      this.takeoutColor="#bdbdbd";
      this.deliveryColor="#6441a5";
      this.takeout=2; //takeout:1 , takeout:2(delivery) 
      this.computePayAmount();      
  }

  back(){
    console.log("[PaymentPage]back comes");
    this.navCtrl.pop();
  }

  moveChargePage(){
    this.navCtrl.push(CashChargePage);
  }

  checkAddressValidityCart(){
    if(this.carts.length==1)
        return true;
    let address=this.carts[0].address;    
    for(var i=1;i<this.carts.length;i++)
        if(this.carts[i].address!=address)
          return false;
    return true;          
  }

  pay(){
    console.log("carts:"+JSON.stringify(this.carts));

    if(!this.checkAddressValidityCart()){   //동일상점 주소에서 대해서만 장바구니 주문이 가능합니다.
        let alert = this.alertController.create({
            subTitle: '동일상점 주소에서 대해서만 장바구니 주문이 가능합니다.',
            buttons: ['OK']
        });
        alert.present().then(()=>{
            console.log("alert done");
        });
        return;           
    }

    if(this.takeout==2 && ( this.deliveryAddress==undefined ||this.deliveryAddress.trim().length==0)){
        let alert = this.alertController.create({
            subTitle: '배달주소를 입력해주시기 바랍니다',
            buttons: ['OK']
        });
        alert.present().then(()=>{
            console.log("alert done");
        });
        return;
    }

    if(this.takeout==2 && this.payAmount<this.carts[0].freeDelivery){
          // 배달료 추가됨.
          this.deliveryFee=this.carts[0].deliveryFee;
    }

    this.carts.total=this.payAmount;
    this.carts.price=this.totalAmount;

    let body:any;
    if(this.paymentSelection=="cash"){
      if(this.storageProvider.cashAmount<this.payAmount){
        let alert = this.alertController.create({
            subTitle: '캐시 잔액이 부족합니다.',
            buttons: ['OK']
        });
        alert.present();
        return;
      }
      body = {      paymethod:this.paymentSelection,
                    orderList:JSON.stringify(this.carts), 
                    orderName:this.orderName,
                    amount:this.payAmount,
                    takeout: this.takeout, // takeout:0(inStore) , 1(takeout), 2(delivery) 
                    orderedTime:new Date().toISOString(),
                    cashId: this.storageProvider.cashId,
                    receiptIssue:this.storageProvider.receiptIssue,
                    receiptId:this.storageProvider.receiptId,
                    receiptType:this.storageProvider.receiptType,
                };
    }else{ // card
      body = {      paymethod:this.paymentSelection,
                    orderList:JSON.stringify(this.carts), 
                    orderName:this.orderName,
                    amount:this.payAmount,
                    takeout: this.takeout, // takeout:0(inStore) , 1(takeout), 2(delivery) 
                    orderedTime:new Date().toISOString(),
                    customer_uid: this.storageProvider.payInfo[this.cardIndex].customer_uid
                };

    }
    if(this.takeout==2){
        body.deliveryAddress=this.deliveryAddress;
        if(this.deliveryFee){
            body.deliveryFee=this.deliveryFee;
        }
    }
      this.navCtrl.push(CashPasswordPage,{body:body,trigger:this.trigger,
                                         title:"결제비밀번호" ,description:"결제 비밀번호를 입력해주세요."});
  }

  cashSelect(){
      this.paymentSelection="cash";
      this.computePayAmount();
      this.currentCashClasses={
      'cash-card':true,  
      'card-unselect-border':false,
      'scroll-col-latest':false,
      'cash-select-border':true,
      'select-scroll-col-latest':true
    };
    console.log("cashSelect:"+this.cardIndex);

    if(this.cardIndex>=0){
            this.currentCardClassesArray[this.cardIndex]={
                'card-card':true,
                'scroll-col-latest':true,
                'card-unselect-border':true,
                'select-scroll-col-latest':false,
                'card-select-border':false
            }; 
    }
    this.cardIndex=-1;
  }

  cardSelect(i){
      this.paymentSelection="card";
      this.computePayAmount(); 
      console.log("unselect card :"+this.cardIndex);
      if(this.cardIndex>=0){
            this.currentCardClassesArray[this.cardIndex]={
                'card-card':true,
                'scroll-col-latest':true,
                'card-unselect-border':true,
                'select-scroll-col-latest':false,
                'card-select-border':false
            }; 
      }

      this.currentCashClasses={
            'cash-card':true,  
            'card-unselect-border':true,
            'scroll-col-latest':true,
            'cash-select-border':false,
            'select-scroll-col-latest':false
        };

      this.currentCardClassesArray[i]={
        'card-card':true,
        'scroll-col-latest':false,
        'card-unselect-border':false,
        'select-scroll-col-latest':true,
        'card-select-border':true
      }; 
      this.cardIndex=i;
         
  }
  
  addCard(){
    this.cardProvider.addCard();
  }

  removeCard(i){
    let alert = this.alertController.create({
        title: this.storageProvider.payInfo[i].info.name+"를 삭제하시겠습니까?",
              buttons: [
        {
          text: '네',
          handler: () => {
            console.log('Agree clicked');
            this.cardProvider.removeCard(i);
          }
        },
        {
          text: '아니오',
          handler: () => {
            console.log('Disagree clicked');
          }
        }
      ]
    });
    alert.present();
  
  }
}
