import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import { WebIntent } from '@ionic-native/web-intent';
import {StorageProvider} from '../../providers/storage/storage';
import { CartProvider } from '../../providers/cart/cart';
import {OrderReceiptPage} from '../order-receipt/order-receipt';

declare var window:any;
var gCardExplainPage;
/**
 * Generated class for the CardExplainPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-card-explain',
  templateUrl: 'card-explain.html',
})
export class CardExplainPage {
  amount:number;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private cartProvider:CartProvider,
              private webIntent:WebIntent,
              private alertCtrl:AlertController,
              private storageProvider:StorageProvider) {
      gCardExplainPage=this;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CardExplainPage');
  }

  confirm(){
     if(this.storageProvider.van=="nice"){
        let price=100;
        let reqVal="appposlink://request?type=payment&price="+price+"&businessNumber="+this.storageProvider.shop.businessNumber+"&catid="+this.storageProvider.catid;​

        this.webIntent.startActivityForResult({ action: this.webIntent.ACTION_VIEW, url: reqVal }).then(function(res){ 
              console.log('startActivityForResult '+JSON.stringify(res)); 
              //console.log(JSON.stringify(res));
              if(res.extras && res.extras.result){
                  console.log(res.extras.result);
                  let result=res.extras.result;
                  //e.g. appposlink://result?gubun=0101&resultCode=9022&oid=0825095741
                  result=result.substring("appposlink://result?".length);
                  console.log("result:"+result);
                  let splits=result.split('&');
                  console.log("splits:"+JSON.stringify(splits));
                  let resultCode=parseInt(splits[1].substring("resultCode=".length));
                  console.log("resultCode:"+resultCode);
                  //["gubun=0101","resultCode=0000","oid=0825102146","appNo=30000160","appPrice=100","appDt=180825102157","cardNo=9431-16**-****-****","issuerCd=11","acquirerCd=11","trNo=20282140010825102146","appCatid=2028214001","merchantReserved1=null","merchantReserved2=null","intMon=00","hash=cb1b7cbf364e62987b136ad389cd852c381d0bdc086c27fa98eeddda1ee0c2af"]"
                  let object:any={};
                  splits.forEach(element=>{
                      let values=element.split('=');
                      let name=values[0];
                      let value=values[1];
                      object[name]=value;
                  });

                  object.resultCode=parseInt(object.resultCode);
                  console.log("object:"+JSON.stringify(object));
              }else{
                  let alert = gCardExplainPage.alertCtrl.create({
                    title: '카드결제에 실패했습니다.',
                    buttons: ['OK']
                  });
                  alert.present();
              }
        }, function(err){ 
                console.log('★★startActivity err'); console.log(err); 
                let alert = gCardExplainPage.alertCtrl.create({
                  title: '카드결제에 실패했습니다.',
                  buttons: ['OK']
                });
                alert.present();
        })
        // 카드 결제 결과 전달.
        window.handleOpenURL = function (url) {
            alert('receive URL2 ' + url);
            this.cartProvider.resetCart();
            this.navCtrl.setRoot(OrderReceiptPage,{class:"OrderReceiptPage"});
        };
     }
  }/* end of confirm() */
}
