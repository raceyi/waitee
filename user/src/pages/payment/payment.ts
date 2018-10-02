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
  //stamp-begin
  availableCouponDiscount=0;
  availableCounponCount=0;
  couponDiscount=0;
  stampUsage=0;
  couponDiscountAmount=0; //constructor의 checkStamp에서 계산됨으로 reset해서는 안된다!!!
  freeMenu;
  //stamp-end
  totalAmount:number=0;
  payAmount:number=0;

  takeout=0; //takeout:1 , takeout:2(delivery)
  deliveryAddress;

  trigger;

  //menu-discount begin
  menuDiscountAmount=0;
  cashDiscountAmount=0;
  //menu-discount end
  computePayAmountDone:boolean=false;

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

    this.checkStamp().then(()=>{
        console.log("checkStamp success");
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
                            this.navCtrl.pop();
                            let alert = this.alertController.create({
                                title: "서버와 통신에 문제가 있습니다.",
                                subTitle:"상점의 결제정보를 가져오는데 실패했습니다.",
                                buttons: ['OK']
                            });
                            alert.present();
                 }else{
                     console.log("Hum...getPayMethod-HttpError");
                 }
        })    
    },err=>{
         if(err=="NetworkFailure"){
                            this.navCtrl.pop();
                            let alert = this.alertController.create({
                                title: "서버와 통신에 문제가 있습니다.",
                                subTitle:"상점의 결제정보를 가져오는데 실패했습니다.",
                                buttons: ['OK']
                            });
                            alert.present();
                 }else{
                     console.log("Hum...getPayMethod-HttpError");
                 }
    });    
  }


 checkStamp(){

       return new Promise((resolve,reject)=>{     
        //상점 정보에서 스탬프가 적용되면 사용자의  스탬프 정보를 서버로 부터 가져온다. 주문 목록에 자동 적용 메뉴가 있으면 스탬프를 그만큼 차감한다. 생성 스탬프의 갯수도 계산한다.
        //getPayMethod와 합쳐서 db query를 최소화해야만 한다 ㅜㅜ 
        let body={takitId:this.carts[0].takitId}
        this.serverProvider.post(this.storageProvider.serverAddress+"/getStampCount",body).then((res:any)=>{
            console.log("getStampConunt res:"+JSON.stringify(res));
            let stampCount=res.stampCount;
            if(res.result=="success"){
                // 각 상점별 정보 stamp정보를 가져와야만 한다. 우선 하나의 상점임으로 carts[0]에 대해서만 확인한다. ㅜㅜ  
                this.serverProvider.getShopInfo(this.carts[0].takitId).then((res:any)=>{
                let shopInfo=res.shopInfo;
                if(shopInfo.stamp!=null && shopInfo.stamp){
                        this.carts[0].stampIssueCount=0; // 주문 준비완료시 서버에서 계산되어 진다. 
                }else{
                    resolve();
                    return;
                }        
                let stampUsageCount:number;
                if(typeof shopInfo.stampUsageCount === "string")
                    stampUsageCount=parseInt(shopInfo.stampUsageCount);
                else
                    stampUsageCount=shopInfo.stampUsageCount;    
                if(stampCount>=stampUsageCount){
                    if(shopInfo.stampFreeAmount!=null && shopInfo.stampFreeMenu==null ){ //가격을 차감한다.
                        let stampFreeAmount=shopInfo.stampFreeAmount;
                        if(typeof stampFreeAmount ==="string")
                            stampFreeAmount=parseInt(stampFreeAmount);
                        this.availableCounponCount=(stampCount- (stampCount%stampUsageCount))/stampUsageCount;
                        this.availableCouponDiscount= this.availableCounponCount*stampFreeAmount;
                        if(this.carts[0].price>this.availableCouponDiscount){ //현재 하나의 매장에서만 주문가능하다.
                                this.couponDiscount=this.availableCounponCount; //쿠폰 사용 갯수
                                this.stampUsage=this.availableCounponCount*stampUsageCount;// stamp사용수
                                this.couponDiscountAmount=this.availableCouponDiscount; //쿠폰 사용 금액
                        }else{ //쿠폰을 남겨놔야한다.
                               let number= Math.round(this.carts[0].price/stampFreeAmount);
                               this.couponDiscount=number;
                               this.stampUsage=number*stampUsageCount;
                               this.couponDiscountAmount=number*stampFreeAmount;
                        }
                    }else if(shopInfo.stampFreeAmount==null && shopInfo.stampFreeMenu!=null ){
                        // 주문목록에 메뉴가 있다면 할인을 적용한다. 주문 목록에 쿠폰 적용 메뉴를 카운트 한다. 
                        this.freeMenu=JSON.parse(shopInfo.stampFreeMenu);
                        let orderCount=0;
                        let menuPrice;
                        for(let i=0;i<this.carts[0].orderList.menus.length;i++){
                            if(this.carts[0].orderList.menus[i].menuNO==this.freeMenu.menuNO && this.carts[0].orderList.menus[i].menuName==this.freeMenu.menuName){
                                orderCount+=this.carts[0].orderList.menus[i].quantity;
                            }
                        }
                        let couponNumber=0; 
                        this.availableCounponCount=(stampCount- (stampCount%stampUsageCount))/stampUsageCount;
                        if(orderCount>0 && this.availableCounponCount>0){ //전체 가격에서 제외한다. 그리고 할인율을 적용한다.
                            if(orderCount>this.availableCounponCount){
                                this.couponDiscount=this.availableCounponCount;
                                this.stampUsage=this.availableCounponCount*stampUsageCount;
                                this.couponDiscountAmount=this.couponDiscount*this.freeMenu.unitPrice;
                            }else{
                                this.couponDiscount=orderCount;
                                this.stampUsage=orderCount*stampUsageCount;
                                this.couponDiscountAmount=orderCount*this.freeMenu.unitPrice;
                            }
                        }   
                    }
                }
                resolve();
            },err=>{
                let alert = this.alertController.create({
                    title: '상점정보를 가져오는데 실패했습니다.',               
                    subTitle: JSON.stringify(err),
                    buttons: ['OK']
                });
                alert.present();
                reject("상점정보를 가져오는데 실패했습니다.");
            });

            }else{
                reject("고객님의 스탬프 정보를 가져오는데 실패했습니다.");
            }
        })
       });
 }

 computePayAmount(){ //현재 carts는 1나만 들어온다. 동일주소에 대해서만 주문 가능함으로. 
    this.cardDiscount=0;
    this.cashDiscount=0;
    this.menuDiscountAmount=0;
    this.cashDiscountAmount=0;

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
                    this.cardDiscount+= Math.round((this.carts[i].price*cardDiscount)/100);
                    this.carts[i].amount=this.carts[i].price-Math.round((this.carts[i].price*cardDiscount)/100);
                }
                if(cashRate!=undefined && this.paymentSelection=="cash"){  //   캐시일 경우만 처리하면? 우선 스탬프는 할인이 적용안되는 매장에만 처리하자. 
                    this.cashDiscount+= Math.round((( this.carts[i].price-this.couponDiscountAmount)*cashDiscount)/100);
                    this.carts[i].amount=(this.carts[i].price-this.couponDiscountAmount)-Math.round((this.carts[i].price*cashDiscount)/100);
                    this.carts[i].couponDiscountAmount=this.couponDiscountAmount;
                    this.carts[i].stampUsage=this.stampUsage;
                    this.carts[i].couponDiscount=this.couponDiscount;
                }else if(this.paymentSelection=="cash"){
                    this.cashDiscount+=this.couponDiscountAmount;
                    this.carts[i].amount=(this.carts[i].price-this.couponDiscountAmount);
                    this.carts[i].couponDiscountAmount=this.couponDiscountAmount;
                    this.carts[i].stampUsage=this.stampUsage;
                    this.carts[i].couponDiscount=this.couponDiscount;
                }
                // compute discount of each menu  // 각 메뉴의 할인을 계산할 이유가 있을까???? 메뉴별로 discount가 틀릴수도 있다 ㅜㅜ . 현재 사용안함.
                let menuDiscountExist=false;
                for(let j=0;j<this.carts[i].orderList.menus.length;j++){
                    if(this.paymentSelection=="cash"){
                        if(this.checkMenuDiscount(this.carts[i].orderList.menus[j])){ //menu discount 적용시 
                            menuDiscountExist=true;
                            let menuDiscount:number;
                            if(typeof this.carts[i].orderList.menus[j].menuDiscount ==="string"){
                                menuDiscount=parseInt(this.carts[i].orderList.menus[j].menuDiscount);
                            }else 
                                menuDiscount=this.carts[i].orderList.menus[j].menuDiscount;
                            menuDiscount=menuDiscount/100;
                            this.menuDiscountAmount+=Math.round(this.carts[i].orderList.menus[j].price*(menuDiscount));
                            this.carts[i].orderList.menus[j].amount= this.carts[i].orderList.menus[j].price-Math.round(this.carts[i].orderList.menus[j].price*(menuDiscount));
                        }else if(cashDiscount){
                            this.carts[i].orderList.menus[j].amount=this.carts[i].orderList.menus[j].price-Math.round((this.carts[i].orderList.menus[j].price*cashDiscount)/100);
                            this.cashDiscountAmount+=Math.round((this.carts[i].orderList.menus[j].price*cashDiscount)/100);
                        }else{
                            this.carts[i].orderList.menus[j].amount=this.carts[i].orderList.menus[j].price; 
                        }                           
                    }else // card
                        this.carts[i].orderList.menus[j].amount=this.carts[i].orderList.menus[j].price-Math.round((this.carts[i].orderList.menus[j].price*cardDiscount)/100);                    
                }
                if(menuDiscountExist){ //compute carts[i].amoun again. cart는 1만 있다. 
                    this.carts[i].amount=this.carts[i].price -(this.menuDiscountAmount+this.cashDiscountAmount);
                }
                console.log("this.cardDiscount: "+this.cardDiscount+ "this.cashDiscount:"+this.cashDiscount)
    }
    if(this.paymentSelection=="cash"){
        if(this.menuDiscountAmount>0){
            //menuDiscount와 다른 부분을 분리하고 나머지 가격에 대해 할인을 적용한다. 
            this.payAmount=this.totalAmount-(this.menuDiscountAmount+this.cashDiscountAmount)-this.couponDiscountAmount;
        }else
            this.payAmount=this.totalAmount-this.cashDiscount-this.couponDiscountAmount;
    }else{
        this.payAmount=this.totalAmount-this.cardDiscount-this.couponDiscountAmount;
    }
    if(this.takeout==2 && this.payAmount<this.carts[0].freeDelivery){
        this.deliveryFee=parseInt(this.carts[0].deliveryFee);
    }else
        this.deliveryFee=undefined;

    console.log("payAmount:"+this.payAmount);
    this.computePayAmountDone=true;
  }

  checkMenuDiscount(menu){
      console.log("checkMenuDiscount:"+JSON.stringify(menu));
      if( menu.menuDiscount && menu.menuDiscount!=null && menu.menuDiscount>0){
          if(menu.menuDiscountOption && menu.menuDiscountOption==null){
              return true;    
          }
          if(menu.menuDiscountOption && menu.menuDiscountOption!=null){
              if(menu.menuDiscountOption){ // menu가 menuDiscountOption중 하나를 가지고 있다면 
                  let menuDiscountOptions=JSON.parse(menu.menuDiscountOption);
                  let options=menu.options;
                  if(typeof options ==="string"){
                      options=JSON.parse(options);
                  }
                  let index=options.findIndex(function(element){
                         for(let i=0;i<menuDiscountOptions.length;i++)
                            if(element.name==menuDiscountOptions[i])
                                return true;
                         return false;       
                  })
                  if(index>=0){  // 할인 조건을 충족함.
                      console.log("checkMenuDiscount return true");
                      return true;
                  }
              } 
          }
          return false;
      }  
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
    if(!this.computePayAmountDone){
            let alert = this.alertController.create({
                title: '결제 금액 계산이 완료되지 않았습니다.',
                subTitle:'잠시 기다려 주십시요.',
                buttons: ['OK']
            });
            alert.present();
            return;
    }
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
      // Just for test-begin  
      if(this.storageProvider.cashAmount<this.payAmount){
          this.serverProvider.checkTossExistence().then(()=>{
                let amount=this.payAmount-this.storageProvider.cashAmount;
                let alert = this.alertController.create({
                    title:'캐시 잔액이 부족합니다.',
                    subTitle: amount+'원을 토스로 충전합니다.',
                    buttons: [
                                {
                                    text: 'Toss로 입금',
                                    cssClass: 'toss-alert-button',    
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
      //Just for test-end
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
