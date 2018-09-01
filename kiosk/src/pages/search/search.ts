import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {MenuPage} from '../menu/menu';
import * as hangul from 'hangul-js';
import { CartProvider } from '../../providers/cart/cart';
import {OrderListPage} from '../order-list/order-list';

/**
 * Generated class for the SearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

  menus=[];
  constructor(public navCtrl: NavController,
              public cartProvider:CartProvider,
              public storageProvider:StorageProvider, 
              public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchPage');
  }

  onInput(ev){
    let val = ev.target.value;
    this.menus=[];
   // console.log("val:"+val);
    if(val!=undefined && val.length>=1){
        let body = {keyword:val}
        console.log("searchMenu");
        for(let i=0;i<this.storageProvider.shop.menus.length;i++){
            if(this.checkInclude(this.storageProvider.shop.menus[i].menuName,val)){
                this.menus.push(this.storageProvider.shop.menus[i]);
            }
        }
    }
  }

checkInclude(menuName,keyword){
    let menu=hangul.d(menuName, true);
    let input=hangul.d(keyword, true);

    for(let i=0;i<input.length;i++){  //각 문자가 입력값을 가지고 있는지 확인한다
        for(let k=0;k<menu.length && input.length<=(menu.length-k);k++){
          //console.log("checkArray:"+JSON.stringify(menu[k]));
          let found=true;
          for(let l=0;l<keyword.length;l++){
            let checkArray=menu[k+l];
            let array=input[l];
            for(let j=0;j<array.length;j++){
              //console.log(array[j]+" "+checkArray[j]);
              if(array[j]!=checkArray[j]){ //각 문자를 비교한다.
                found=false;
                break;
              }
            }
          }
          if(found)
              return true;
        }
    }
    return false;
  }   

  goToMenu(menu){
    this.navCtrl.push(MenuPage,{menu:menu,class:"MenuPage"});
  }

  back(){
    this.navCtrl.pop();
  }
  
   moveOrderList(){
    this.navCtrl.push(OrderListPage,{class:"OrderListPage"});
  }  
}
