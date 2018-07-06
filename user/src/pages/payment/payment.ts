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
  inStoreColor="#FF5F3A";
  takeoutColor="#bdbdbd";
  deliveryColor="#bdbdbd";

  cardAvailable:boolean=false;

  deliveryAvailable:boolean=false;  ///////동일 매장에서만 배송이 가능합니다.
  takeoutAvailable:boolean=false;   ////// 일부 메뉴 포장시 따로 주문결제를 수행해 주시기 바랍니다. 

  deliveryFee:number;

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
    console.log("!!!!!payments constructor!!!!!");

    let param=JSON.parse(navParams.get('order'));
    console.log("param:"+JSON.stringify(param));
    this.carts=param.carts;
    //this.orderName=JSON.stringify(param.orderName);
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
        console.log("cart.price:"+cart.price);
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
                let cardDiscount:number;
               let cashDiscount:number;

                if(cardRate!=undefined)
                    cardDiscount=parseFloat(cardRate.substr(0,cardRate.length-1));
                if(cashRate!=undefined)    
                    cashDiscount=parseFloat(cashRate.substr(0,cashRate.length-1));
                if(cardRate!=undefined && this.paymentSelection=="card"){
                    this.cardDiscount+= (this.carts[i].price*cardDiscount)/100;
                    this.carts[i].amount=this.carts[i].price-((this.carts[i].price*cardDiscount)/100);
                }
                if(cashRate!=undefined && this.paymentSelection=="cash"){
                    this.cashDiscount+= (this.carts[i].price*cashDiscount)/100;
                    this.carts[i].amount=this.carts[i].price-((this.carts[i].price*cashDiscount)/100);
                }
                // compute discount of each menu
                for(var j=0;j<this.carts[i].orderList.menus.length;j++){
                    if(this.paymentSelection=="cash")
                        this.carts[i].orderList.menus[j].amount=this.carts[i].orderList.menus[j].price-((this.carts[i].orderList.menus[j].price*cashDiscount)/100);
                    else // card
                        this.carts[i].orderList.menus[j].amount=this.carts[i].orderList.menus[j].price-((this.carts[i].orderList.menus[j].price*cardDiscount)/100);                    
                }
                console.log("this.cardDiscount: "+this.cardDiscount+ "this.cashDiscount:"+this.cashDiscount)
    }

    if(this.paymentSelection=="cash")
        this.payAmount=this.totalAmount-this.cashDiscount;
    else
        this.payAmount=this.totalAmount-this.cardDiscount;

    if(this.takeout==2 && this.payAmount<this.carts[0].freeDelivery){
        this.deliveryFee=parseInt(this.carts[0].deliveryFee);
    }else
        this.deliveryFee=undefined;

    console.log("payAmount:"+this.payAmount);
  }

  pickupChange(takeout){
    this.takeout=takeout;
    this.computePayAmount();
  }

  checkTakeoutAvailable(){
    for(var i=0;i<this.carts.length;i++){
      this.takeoutAvailable=true;      
      for(var j=0;j<this.carts[i].orderList.menus.length;j++){
        if(this.carts[i].orderList.menus[j].takeout==undefined
            || this.carts[i].orderList.menus[j].takeout==null 
            || this.carts[i].orderList.menus[j].takeout<1){
            this.takeoutAvailable=false;
            return;
        }
      }
    }
    this.takeoutAvailable=true;
  }

  checkDeliveryAvailable(){
    // 하나의 상점 주문에서만 배송 가능
    //console.log("checkDeliveryAvailable-1 ");
    if(this.carts.length>1){
        this.deliveryAvailable=false;
        return;
    }
    //console.log("checkDeliveryAvailable-2 ");
    if(this.carts[0].deliveryArea==undefined || this.carts[0].deliveryArea==null){
        this.deliveryAvailable=false;
        return;
    }
    //console.log("checkDeliveryAvailable-3 ");
    for(var j=0;j<this.carts[0].orderList.menus.length;j++)
        if(this.carts[0].orderList.menus[j].takeout<1){
            this.deliveryAvailable=false;
            return;
        }
    //console.log("checkDeliveryAvailable-4 ");

    this.deliveryAvailable=true;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PaymentPage');
  }

  selectInStore(){
      this.inStoreColor="#FF5F3A";
      this.takeoutColor="#bdbdbd";
      this.deliveryColor="#bdbdbd";
      this.takeout=0; //takeout:1 , takeout:2(delivery)
      this.computePayAmount();
  }

  selectTakeOut(){
      this.inStoreColor="#bdbdbd";
      this.takeoutColor="#FF5F3A";
      this.deliveryColor="#bdbdbd";
      this.takeout=1; //takeout:1 , takeout:2(delivery)
      this.computePayAmount();      
  }

  selectDelivery(){
      this.inStoreColor="#bdbdbd";
      this.takeoutColor="#bdbdbd";
      this.deliveryColor="#FF5F3A";
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

  removeSpecialCharacters(str){
      var pattern = /^[a-zA-Zㄱ-힣0-9|s]*$/;
        let update="";

        for(let i=0;i<str.length;i++){
             if(str[i].match(pattern) || str[i]===" "){
                update+=str[i];
            }else{
                console.log("NOK-special characters");
            }
        }
        return update;
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
    
    for(var i=0;i<this.carts.length;i++){
        let cart=this.carts[i];
        console.log("cart.timeConstraints:"+JSON.stringify(cart.timeConstraints));
        for(var j=0;j<cart.timeConstraints.length;j++)
            if(!this.checkOneTimeConstraint(cart.timeConstraints[j]))
                return false;
    }
    return true;
  }

  pay(){
    console.log("carts:"+JSON.stringify(this.carts));

    if(this.storageProvider.tourMode){
            let alert = this.alertController.create({
                title: '둘러보기모드입니다.',
                buttons: ['OK']
            });
            alert.present();
            return;
    }

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
    console.log("this.checkTimeConstraint(): "+this.checkTimeConstraint());

    if(!this.checkTimeConstraint()){
        console.log("checkTimeConstraint return false");
        let alert = this.alertController.create({
            subTitle: '현재 시간에 주문이 불가능한 메뉴가 포한되어 있습니다.',
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

    this.carts.total=this.payAmount;
    this.carts.price=this.totalAmount;

    let body:any;
    if(this.paymentSelection=="cash"){
      if(this.storageProvider.cashAmount<this.payAmount){
          this.serverProvider.checkTossExistence().then(()=>{
                let amount=this.payAmount-this.storageProvider.cashAmount;
                let alert = this.alertController.create({
                    title:'캐시 잔액이 부족합니다.',
                    subTitle: amount+'원을 토스로 충전합니다.',
                    buttons: [
                                {
                                    text: '네',
                                    handler: () => {
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
          },err=>{
                let alert = this.alertController.create({
                    subTitle: '캐시 잔액이 부족합니다.',
                    buttons: ['OK']
                });
                alert.present();            
        });
        return;
      }
      let carts=this.carts;
      this.carts.forEach((order)=>{
        delete order.freeDelivery;
        delete order.deliveryFee;
        delete order.address; 
      });
      body = {      payment:this.paymentSelection,
                    orderList:JSON.stringify(this.carts), 
                    //orderName:this.orderName, each cart has own orderName.
                    amount:this.payAmount,
                    takeout: this.takeout, // takeout:0(inStore) , 1(takeout), 2(delivery) 
                    orderedTime:new Date().toISOString(),
                    cashId: this.storageProvider.cashId,
                    receiptIssue:this.storageProvider.receiptIssue,
                    receiptId:this.storageProvider.receiptId,
                    receiptType:this.storageProvider.receiptType,
                };
    }else{ // card
      body = {      payment:this.paymentSelection,
                    orderList:JSON.stringify(this.carts), 
                    //orderName:this.orderName, each cart has own orderName
                    amount:this.payAmount,
                    takeout: this.takeout, // takeout:0(inStore) , 1(takeout), 2(delivery) 
                    orderedTime:new Date().toISOString(),
                    customer_uid: this.storageProvider.payInfo[this.cardIndex].customer_uid
                };

    }
    if(this.takeout==2){
        body.deliveryAddress=this.removeSpecialCharacters(this.deliveryAddress);
        if(this.deliveryFee){
            body.deliveryFee=this.deliveryFee;
        }
    }

    if(body.deliveryFee)
        body.total=body.amount+body.deliveryFee;
    else    
        body.total= body.amount;
    
    console.log("body.total:"+body.total);
    this.navCtrl.push(CashPasswordPage,{body:body,trigger:this.trigger,
                                         title:"결제비밀번호" ,description:"결제 비밀번호를 입력해주세요.",
                                         class:"CashPasswordPage"});
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
    if(this.storageProvider.tourMode){
            let alert = this.alertController.create({
                title: '둘러보기모드입니다.',
                buttons: ['OK']
            });
            alert.present();
            return;
    }
    this.cardProvider.addCard().then((res)=>{
            this.ngZone.run(()=>{
                this.currentCardClassesArray.push({
                    'card-card':true,
                    'scroll-col-latest':true,
                    'card-unselect-border':true,
                    'select-scroll-col-latest':false,
                    'card-select-border':false
                });
            });            
        },err=>{

        });
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
            this.currentCardClassesArray.splice(i,1);
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
