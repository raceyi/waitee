import { Component ,NgZone} from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController,Events} from 'ionic-angular';
import { ShopPage} from '../shop/shop';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import {TimeUtil} from '../../classes/TimeUtil';
/**
 * Generated class for the OrderDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-order-detail',
  templateUrl: 'order-detail.html',
})
export class OrderDetailPage {
  order;
  timeUtil= new TimeUtil(); 
  payClasses;
  refundClasses;

  constructor(public navCtrl: NavController, 
              public alertController:AlertController,
              public storageProvider:StorageProvider,
              public serverProvider:ServerProvider,
              private events:Events,    
              private ngZone:NgZone,          
              public navParams: NavParams) {
    console.log("orderDetailPage constructor");
    this.order=this.navParams.get("order");
    console.log("order:"+JSON.stringify(this.order));    

    if(this.order.payMethod=="cash")
        this.order.paymentString="캐시";
    else{
        console.log("this.order.card_info:"+this.order.card_info);
        let card_info;
        if(typeof this.order.card_info ==="string")
            card_info=JSON.parse(this.order.card_info);
        this.order.paymentString=card_info.name+" "+card_info.mask_no; 
    }

    let orderTimeString="";

    console.log("orderList:"+this.order.orderList);    
    this.order.orderListObj=JSON.parse(this.order.orderList);
    
    this.order.price=0;
    for(var i=0;i<this.order.orderListObj.menus.length;i++)
        this.order.price+= this.order.orderListObj.menus[i].price;
    console.log("price:"+this.order.price);

    this.order.discount=this.order.price-this.order.amount;

    this.order.localOrderedTimeString=this.dayInPrintOut(this.order.localOrderedTime,this.order.localOrderedDay);

    console.log(this.order.localOrderedTimeString);
    if(this.order.hasOwnProperty("localCheckedTime") && this.order.localCheckedTime!=null){
        this.order.localCheckedTimeString=this.dayInPrintOut(this.order.localCheckedTime,this.order.localCheckedDay);
    }
    if(this.order.hasOwnProperty("localCompleteTime") && this.order.localCompleteTime!=null){
        this.order.localCompleteTimeString=this.dayInPrintOut(this.order.localCompleteTime,this.order.localCompleteDay);
    }
   // Please use below line once server is fixed. 
   // if(this.order.hasOwnProperty("localCancelledTime") && this.order.localCancelledTime!=null){
   //     this.order.localCancelledTimeString=this.dayInPrintOut(this.order.localCancelledTime,this.order.localCancelledDay);
   // }
    if(this.order.hasOwnProperty("localPickupTime")  && this.order.localPickupTime!=null){
        this.order.localPickupTimeTimeString=this.dayInPrintOut(this.order.localPickupTime,this.order.localPickupDay);
    }
    //console.log("menus:"+JSON.stringify(this.order.orderListObj.menus));
     console.log("cancelledTime:"+this.order.cancelledTime); // Why wrong localCancelledTimeString?
    if(this.order.orderStatus=="cancelled"){
        if(this.order.hasOwnProperty("cancelledTime")){
            console.log("call getLocalTimeString")
            this.order.localCancelledTimeString=this.timeUtil.getlocalTimeString(this.order.cancelledTime);
        }
    }else{
            this.order.localCancelledTimeString=undefined;
    }
    if(this.order.orderStatus=="cancelled"){
        this.payClasses={
            paymentLast:false,
            payment:true
        };
        this.refundClasses={
            paymentLast:true,
            payment:false
        };
    }else{
        this.payClasses={
            paymentLast:true,
            payment:false
        };
    }
  }

  dayInPrintOut(time,day){
        let string=time.substr(0,4)+"/"+
            time.substr(5,2)+"/"+
            time.substr(8,2)+" "+
            this.dayInKorean(day)+" "+
            time.substr(11,5);   
        return string;
  }

  dayInKorean(day){  //please use moment or other library for langauge later
    switch(day){
      case  '0': return '일요일';
      case  '1': return '월요일';
      case  '2': return '화요일';
      case  '3': return '수요일';
      case  '4': return '목요일';
      case  '5': return '금요일';
      case  '6': return '토요일';
    }
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderDetailPage');
  }

  back(){
    console.log("back");
    if( this.navCtrl.canGoBack() ){
        this.navCtrl.pop();
    }else{
        this.navCtrl.setRoot(ShopPage,{takitId:this.order.takitId});
    }
  }

  cancel(){
        console.log("cancel order:"+JSON.stringify(this.order));
        this.serverProvider.cancelOrder(this.order).then((resOrder)=>{
            // do nothing
            this.payClasses={
                paymentLast:false,
                payment:true
            };
            this.refundClasses={
                paymentLast:true,
                payment:false
            };
        });
  }
}
