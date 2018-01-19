import { Component,NgZone,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams ,Scroll} from 'ionic-angular';
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
  @ViewChild("scroll") scrollElement: Scroll;

  inStoreColor="#6441a5";
  takeoutColor="#bdbdbd";
  deliveryColor="#bdbdbd";
  paymethods=[{name:"비자카드",type:"card"},
              {name:"마스터카드",type:"card"},
              {name:"휴대폰결제",tyep:"phone"}
  ];
  paymentSelection="cash";

  //param;
  carts;
  orderName;

  cardDiscount;
  cashDiscount;

  totalAmount=0;
  payAmount=0;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private ngZone:NgZone,
              public storageProvider:StorageProvider) {

    let param=JSON.parse(navParams.get('order'));
    console.log("param:"+JSON.stringify(param));
    this.carts=param.carts;
    this.orderName=JSON.stringify(param.orderName);
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
  }

  selectTakeOut(){
      this.inStoreColor="#bdbdbd";
      this.takeoutColor="#6441a5";
      this.deliveryColor="#bdbdbd";
  }

  selectDelivery(){
      this.inStoreColor="#bdbdbd";
      this.takeoutColor="#bdbdbd";
      this.deliveryColor="#6441a5";
  }

  moveChargePage(){
    this.navCtrl.push(CashChargePage);
  }

  pay(){
      /*
            let body = {    paymethod:"cash",
                            takitId:this.takitId,
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
                            shopName:this.shopName,
                            userMSG:this.userMSG
                        };
      */
    //this.navController.push(CashPassword, {body:body,trigger:this.trigger});
   /*
    this.navCtrl.setRoot(OrderDetailPage,
        {order:JSON.stringify({"orderId":"1490","takitId":"TEST2@TAKIT","shopName":"가로수그늘아래","orderName":"바닐라라떼(1)","payMethod":"cash","amount":"0","takeout":"0","arrivalTime":null,"orderNO":"1","userId":"60","userName":"이경주","userPhone":"01027228226","orderStatus":"paid","orderList":"{\"menus\":[{\"menuNO\":\"TEST2@TAKIT;1\",\"menuName\":\"바닐라라떼\",\"quantity\":1,\"options\":[],\"price\":\"0\",\"amount\":0}],\"total\":0,\"prevAmount\":0,\"takitDiscount\":0,\"couponDiscount\":0}","deliveryAddress":"","userMSG":null,"orderedTime":"2018-01-02 07:53:13","checkedTime":null,"completedTime":null,"cancelledTime":null,"localCancelledTime":null,"cancelReason":null,"localOrderedTime":"2018-01-02 16:53:13","localOrderedDay":"2","localOrderedHour":"16","localOrderedDate":"2018-01-02","receiptIssue":"1","receiptId":"01027228226","receiptType":"IncomeDeduction"})});
    */    
  }

  cashSelect(){
      this.paymentSelection="cash";
      this.computePayAmount();
  }

  cardSelect(card){
      this.paymentSelection="card";
      this.computePayAmount();      
  }
  
}
