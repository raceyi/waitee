import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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

}
