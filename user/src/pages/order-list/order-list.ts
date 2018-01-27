import { Component ,NgZone} from '@angular/core';
import { IonicPage, NavController, NavParams,App,AlertController,Events } from 'ionic-angular';
import {ReviewInputPage} from '../review-input/review-input';
import {OrderDetailPage} from '../order-detail/order-detail';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import {TimeUtil} from '../../classes/TimeUtil';

/**
 * Generated class for the OrderListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-order-list',
  templateUrl: 'order-list.html',
})
export class OrderListPage {
   orders=[];
   lastOrderId=-1;
   infiniteScroll;
   timeUtil= new TimeUtil(); 

  index=0; // 0: 1개월, 1:2개월, 2:3개월, 3:6개월 
  searchText;
  searchDone=false;
  colStyle=[];
  buttonStyle=[];

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public storageProvider:StorageProvider,
              public serverProvider:ServerProvider,
              public alertController:AlertController,
              private events:Events,  
              private app:App) {
    this.colStyle=[
          {"border-right-style": "solid",
           "border-width": "1px",
           "border-radius":"13.5px"
          },
          {
            'boder-style':'none'
          },
          {
            'boder-style':'none'
          },
          {
            'boder-style':'none'
          }
    ];

    this.buttonStyle=[
          {'color':'#6441a5' },
          {'color':'#bdbdbd' },
          {'color':'#bdbdbd' },
          {'color':'#bdbdbd' }
    ];

    events.subscribe('orderUpdate', (param) =>{
      console.log("orderUpdate comes at order-list");
      this.refreshOrderList();
    });
}

  getOrderStatusString(order){
    console.log("status:"+order.orderStatus);
    if(order.orderStatus=="paid")
      return "결제완료";
    if(order.orderStatus=="cancelled")
      return "주문취소";
    if(order.orderStatus=="checked")
      return "주문접수";
    if(order.orderStatus=="completed")
      return "준비완료";      
    if(order.orderStatus=="pickup"){
      return "픽업완료("+ this.timeUtil.getlocalTimeStringWithoutDay(order.pickupTime)+')';
    }  
  }

  getDisplayTime(measureTime){
    return measureTime[2]+measureTime[3]+"/"+
          measureTime[5]+measureTime[6]+"/"+
          measureTime[8]+measureTime[9]+" "+
          measureTime[11]+measureTime[12]+":"+
          measureTime[14]+measureTime[15];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderListPage');
  }
  
  ionViewWillEnter() {
    console.log('ionViewWillEnter OrderListPage');
    this.refreshOrderList();
  }

  refreshOrderList(){
    if(this.infiniteScroll!=undefined)
        this.infiniteScroll.enable(true); //stop infinite scroll
    this.orders=[]; // refresh orders when it enters this page.
    this.lastOrderId=-1;
    this.getOrders().then((value)=>{
        console.log("getOrders done continue"+value);
    });
  }

  resetStyle(){
    this.buttonStyle=[
          {'color':'#bdbdbd' },
          {'color':'#bdbdbd' },
          {'color':'#bdbdbd' },
          {'color':'#bdbdbd' }]

    this.colStyle=[
          {
            'boder-style':'none'
          },
          {
            'boder-style':'none'
          },
          {
            'boder-style':'none'
          },
          {
            'boder-style':'none'
          }
    ];
  }

  select(index){
    console.log("select "+index+ " this.index:"+this.index);
    this.resetStyle();
    this.buttonStyle[index]={'color':'#6441a5' };
    if(index==0)
        this.colStyle[index]={"border-right-style": "solid",
                            "border-width": "1px",
                            "border-radius":"13.5px"
                          };
    else if(index==3)
        this.colStyle[index]={"border-left-style": "solid",
                            "border-width": "1px",
                            "border-radius":"13.5px"
                          };
    else{
        this.colStyle[index]={"border-left-style": "solid",
                              "border-right-style": "solid",
                              "border-width": "1px",
                              "border-radius":"13.5px"
                          };      
    }
    this.index=index;                      
    console.log("index:"+index);                       
  }

  search(){
    console.log("search comes");
    this.searchDone=true;
  }

  clear(){
    console.log("clear comes");
    this.searchDone=false;
  }

  inputReview(order){
     this.app.getRootNavs()[0].push(ReviewInputPage,{order:order});
  }

  orderDetail(order){  
      this.app.getRootNavs()[0].push(OrderDetailPage,{order:order});
  }

  cancelOrder(order){
    this.serverProvider.cancelOrder(order).then((resOrder)=>{
        this.app.getRootNav().push( OrderDetailPage,{order:resOrder});
    });
  }

  doInfinite(infiniteScroll) {
    console.log('Begin async operation');
    this.getOrders().then((more)=>{
      if(more){
          console.log("more is true");
          infiniteScroll.complete();
      }else{
          console.log("more is false");
          infiniteScroll.enable(false); //stop infinite scroll
      }
    },err=>{
          // hum...
    });
  }

  convertOrder(order){
     order.orderStatusString =this.getOrderStatusString(order);
     order.orderedTimeString=order.localOrderedTime[2]+order.localOrderedTime[3]+"/"+
                              order.localOrderedTime[5]+order.localOrderedTime[6]+"/"+
                              order.localOrderedTime[8]+order.localOrderedTime[9]+" "+
                              order.localOrderedTime[11]+order.localOrderedTime[12]+":"+
                              order.localOrderedTime[14]+order.localOrderedTime[15];
      let strs=order.takitId.split("@");
      order.name_sub = strs[0];
      order.name_main= strs[1];
  }
  
  getOrders(){
        return new Promise((resolve,reject)=>{
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            console.log("server:"+ this.storageProvider.serverAddress);
            let body={ lastOrderId: this.lastOrderId,
                       limit:this.storageProvider.OrdersInPage
                     };
            console.log("getOrders:"+body);
            this.serverProvider.post(this.storageProvider.serverAddress+"/getOrdersDefault",body).then((res:any)=>{
              console.log("orders:"+JSON.stringify(res.orders));
              console.log("orders.length:"+res.orders.length);
              console.log("orders[0]:"+JSON.stringify(res.orders[0]));
            if(res.result=="success" && Array.isArray(res.orders)){
                  res.orders.forEach((order)=>{
                        this.convertOrder(order);              
                        this.orders.push(order);
                  })
                  console.log("orders:"+JSON.stringify(this.orders));
                  this.lastOrderId=res.orders[res.orders.length-1].orderId;
                  if(res.orders.length<this.storageProvider.OrdersInPage){
                        resolve(false); // no more orders
                  }else{
                        resolve(true); // more orders can be shown.
                  }
            }else if(res.orders=="0"){ //Please check if it works or not
                console.log("no more orders");
                resolve(false);
            }else{
                console.log("What happen? !!!sw bug!!!");
            }
         },(err)=>{
            let alert = this.alertController.create({
                title: '서버와 통신에 문제가 있습니다',
                subTitle: '네트웍상태를 확인해 주시기바랍니다',
                buttons: ['OK']
            });
            alert.present();
            reject(err);
         });
       });
  }

}
