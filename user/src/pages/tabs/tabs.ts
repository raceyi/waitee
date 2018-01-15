import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { HomePage } from '../home/home';
import {MyFavoritePage} from '../my-favorite/my-favorite';
import {MyInfoPage} from '../my-info/my-info';
import {OrderListPage} from '../order-list/order-list';
import {WalletPage} from '../wallet/wallet';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = MyFavoritePage;
  tab3Root = OrderListPage;
  tab4Root = WalletPage;
  tab5Root = MyInfoPage;

  constructor(public serverProvider:ServerProvider,
              private alertCtrl:AlertController,
              public storageProvider:StorageProvider){
                
    if(this.storageProvider.cashId!=undefined && this.storageProvider.cashId.length>=5){
        let body = {cashId:this.storageProvider.cashId};
        console.log("getBalanceCash "+body);
        this.serverProvider.post(this.storageProvider.serverAddress+"/getBalanceCash",body).then((res:any)=>{
            console.log("getBalanceCash res:"+JSON.stringify(res));
            if(res.result=="success"){
                this.storageProvider.cashAmount=res.balance;
            }else{
                let alert = this.alertCtrl.create({
                    title: "캐쉬정보를 가져오지 못했습니다.",
                    buttons: ['OK']
                });
                alert.present();
            }
        },(err)=>{
                    if(err=="NetworkFailure"){
                                let alert = this.alertCtrl.create({
                                    title: "서버와 통신에 문제가 있습니다.",
                                    buttons: ['OK']
                                });
                                alert.present();
                    }else{
                        console.log("Hum...getBalanceCash-HttpError");
                    } 
        });
    }
  }
  


}
