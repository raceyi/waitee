import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ShopPage} from '../shop/shop';

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
  
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.order=JSON.parse(this.navParams.get("order"));
    console.log("order:"+JSON.stringify(this.order));    
    let d=new Date(this.getGMTtimeInMilliseconds(this.order.orderedTime));
    console.log("date:"+d.getDay());
    let orderTimeString=d.getFullYear()+"/"+d.getMonth()+"/"+d.getDate()+" "+d.getDay()+" "+d.getHours()+" "+d.getMinutes();
    console.log("orderTimeString:"+orderTimeString);
    
    this.order.orderListObj=JSON.parse(this.order.orderList);

    /* What is local time? hum... It should be shop time
    if(this.order.localOrderedTime)
        this.order.localOrderedTimeString  =
    if(this.order.localCompleteTime)  
        this.order.localCompleteTimeString =
    if(this.order.localCheckedTime)  
        this.order.localCheckedTimeString  =
    if(this.order.localCanceledTime)    
        this.order.localCanceledTimeString =
    if(this.order.localPickupTime)    
        this.order.localPickupTime=
    */

    this.order.localOrderedTimeString = "2017/10/09 월요일  12:19"
    this.order.localCompleteTimeString ="2017/10/09 월요일  12:19"
    this.order.localCheckedTimeString = "2017/10/09 월요일  12:19"
    this.order.localCanceledTimeString ="2017/10/09 월요일  12:19"
    this.order.localPickupTimeString ="2017/10/09 월요일  12:19"
  }

  getGMTtimeInMilliseconds(time:string){
      let year=parseInt(time.substr(0,4));
      let month=parseInt(time.substr(5,2))-1;
      let day=parseInt(time.substr(8,2));
      let hours=parseInt(time.substr(11,2));
      let minutes=parseInt(time.substr(14,2));
      let seconds=parseInt(time.substr(17,2));
      var d=Date.UTC(year, month, day, hours, minutes, seconds);
      return d;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderDetailPage');
  }

  back(){
    if( this.navCtrl.canGoBack() ){
        this.navCtrl.pop();
    }else{
        this.navCtrl.setRoot(ShopPage);
    }
  }
}
