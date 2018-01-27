import { Component,NgZone,ViewChild } from '@angular/core';
import { IonicPage, NavController,ViewController, NavParams ,Scroll} from 'ionic-angular';
import {OrderDetailPage} from '../order-detail/order-detail';
import {StorageProvider} from '../../providers/storage/storage';
import {CashChargePage} from '../cash-charge/cash-charge';

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

  totalAmount=0;
  payAmount=0;

  takeout=0; //takeout:1 , takeout:2(delivery)
  deliveryAddress;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private ngZone:NgZone,
              public storageProvider:StorageProvider) {

    let param=JSON.parse(navParams.get('order'));
    console.log("param:"+JSON.stringify(param));
    this.carts=param.carts;
    this.orderName=JSON.stringify(param.orderName);


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
      this.totalAmount+=cart.amount; 
      shops.push(cart.takitId)
    });

      /*
      let body = {takitIds:JSON.stringify(shops)};
        this.serverProvider.post(this.storageProvider.serverAddress+"/getPayMethod",body).then((res:any)=>{
            console.log("getPayMethod-res:"+JSON.stringify(res));
            if(res.result=="success"){
                console.log("res.getPayMethod:"+res.getPayMethod);
                this.ngZone.run(()=>{
                    computePayAmount();
                });
                console.log("takitId:"+ cart.takitId +"getPayMethod:"+cart.getPayMethod);
            }else{
                console.log("couldn't get discount rate of "+cart.takitId+" due to unknwn reason");
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
        */
        this.carts[0].paymethod={card:'2%',cash:'5%'};
        this.ngZone.run(()=>{
          /*
                let cardRate:string=this.carts[0].paymethod.card;
                let cashRate:string=this.carts[0].paymethod.cash;
                console.log('card:'+parseFloat(cardRate.substr(0,cardRate.length-1)));
                console.log('cash:'+parseFloat(cashRate.substr(0,cashRate.length-1)));
                this.cardDiscount= this.carts[0].amount*parseFloat(cardRate.substr(0,cardRate.length-1))/100;
                this.cashDiscount= this.carts[0].amount*parseFloat(cashRate.substr(0,cashRate.length-1))/100;
                console.log("this.cardDiscount: "+this.cardDiscount+ "this.cashDiscount:"+this.cashDiscount)
            */
            this.computePayAmount();
        });   
        
                    let  views:ViewController[]; 
            views=this.navCtrl.getViews();
            views.forEach(view=>{
                console.log("view.name:"+view.name);   
                console.log("view.id "+view.id);
                console.log("view.instance "+typeof view.instance );
                if(view.getNavParams().get("class")!=undefined){
                    console.log("class:"+view.getNavParams().get("class"));
                    if(view.getNavParams().get("class")=="CashPasswordPage" ||
                      view.getNavParams().get("class")=="MenuPage")  {
                            this.navCtrl.removeView(view);
                      }             
                }
            })
     
  }

  computePayAmount(){
    this.cardDiscount=0;
    this.cashDiscount=0;
    for(var i=0;i<this.carts.length;i++){ 
                let cardRate:string=this.carts[i].paymethod.card;
                let cashRate:string=this.carts[i].paymethod.cash;
                console.log('card:'+parseFloat(cardRate.substr(0,cardRate.length-1)));
                console.log('cash:'+parseFloat(cashRate.substr(0,cashRate.length-1)));
                this.cardDiscount+= this.carts[i].amount*parseFloat(cardRate.substr(0,cardRate.length-1))/100;
                this.cashDiscount+= this.carts[i].amount*parseFloat(cashRate.substr(0,cashRate.length-1))/100;
                console.log("this.cardDiscount: "+this.cardDiscount+ "this.cashDiscount:"+this.cashDiscount)
    }

    if(this.paymentSelection=="cash")
        this.payAmount=this.totalAmount-this.cashDiscount;
    else
        this.payAmount=this.totalAmount-this.cardDiscount;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PaymentPage');
  }

  selectInStore(){
      this.inStoreColor="#6441a5";
      this.takeoutColor="#bdbdbd";
      this.deliveryColor="#bdbdbd";
      this.takeout=0; //takeout:1 , takeout:2(delivery)
  }

  selectTakeOut(){
      this.inStoreColor="#bdbdbd";
      this.takeoutColor="#6441a5";
      this.deliveryColor="#bdbdbd";
      this.takeout=1; //takeout:1 , takeout:2(delivery)
  }

  selectDelivery(){
      this.inStoreColor="#bdbdbd";
      this.takeoutColor="#bdbdbd";
      this.deliveryColor="#6441a5";
      this.takeout=2; //takeout:1 , takeout:2(delivery)
  }

  moveChargePage(){
    this.navCtrl.push(CashChargePage);
  }

  pay(){
      /*
            let body = {    paymethod:"cash",
                            //takitId:this.takitId,
                            orderList:JSON.stringify(cart), 
                            orderName:orderName,
                            amount:this.totalAmount,
                            takeout: takeout, // takeout:0(inStore) , 1(takeout), 2(delivery) 
                            deliveryAddress: this.deliveryAddress,
                            orderedTime:new Date().toISOString(),
                            cashId: this.storageProvider.cashId,
                            //password:this.cashPassword,
                            receiptIssue:this.receiptChecked,
                            receiptId:this.storageProvider.receiptId,
                            receiptType:this.storageProvider.receiptType,
                            //couponNO:this.selectedCoupon.couponName,
                            //shopName:this.shopName,
                            //userMSG:this.userMSG
                        };
    this.navController.push(CashPassword, {body:body,trigger:this.trigger});
   /*
    this.navCtrl.setRoot(OrderDetailPage,
        {order:JSON.stringify({"orderId":"1490","takitId":"TEST2@TAKIT","shopName":"가로수그늘아래","orderName":"바닐라라떼(1)","payMethod":"cash","amount":"0","takeout":"0","arrivalTime":null,"orderNO":"1","userId":"60","userName":"이경주","userPhone":"01027228226","orderStatus":"paid","orderList":"{\"menus\":[{\"menuNO\":\"TEST2@TAKIT;1\",\"menuName\":\"바닐라라떼\",\"quantity\":1,\"options\":[],\"price\":\"0\",\"amount\":0}],\"total\":0,\"prevAmount\":0,\"takitDiscount\":0,\"couponDiscount\":0}","deliveryAddress":"","userMSG":null,"orderedTime":"2018-01-02 07:53:13","checkedTime":null,"completedTime":null,"cancelledTime":null,"localCancelledTime":null,"cancelReason":null,"localOrderedTime":"2018-01-02 16:53:13","localOrderedDay":"2","localOrderedHour":"16","localOrderedDate":"2018-01-02","receiptIssue":"1","receiptId":"01027228226","receiptType":"IncomeDeduction"})});
    */    
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

  back(){
      this.navCtrl.pop();
  }
}
