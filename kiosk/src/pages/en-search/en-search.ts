import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,Content,App } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {EnMenuPage} from '../en-menu/en-menu';
import * as hangul from 'hangul-js';
import { CartProvider } from '../../providers/cart/cart';
import {OrderListPage} from '../order-list/order-list';
import { Keyboard } from '@ionic-native/keyboard';

/**
 * Generated class for the EnSearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-en-search',
  templateUrl: 'en-search.html',
})
export class EnSearchPage {

 @ViewChild("searchContent") public contentRef: Content;

  menus=[];
  categories:any=[];
  constructor(public navCtrl: NavController,
              public cartProvider:CartProvider,
              private app:App,
              private keyboard: Keyboard,
              //public storageProvider:StorageProvider, 
              public navParams: NavParams) {
        this.categories=this.navParams.get("categories");
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
        for(let i=0;i<this.categories.length;i++){
          for(let j=0;j<this.categories[i].menus.length;j++){
            if(this.categories[i].menus[j].menuNameEn && this.checkInclude(this.categories[i].menus[j].menuNameEn.toUpperCase(),val.toUpperCase())){
                this.menus.push(this.categories[i].menus[j]);
            }
          }
        }
    }
     this.contentRef.resize();
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
    this.navCtrl.push(EnMenuPage,{menu:menu,class:"enMenuPage"});
  }

  ionViewWillLeave(){
    console.log("keyboard hide");
    this.keyboard.hide(); // 이전화면으로 돌아갈때 keyboard가 show인경우 문제가 된다. 
  }

  back(){
    this.keyboard.hide();
    this.navCtrl.pop();
  }
  
   moveOrderList(){
    this.navCtrl.push(OrderListPage,{class:"OrderListPage"});
  }  

  resetCart(){
    this.cartProvider.resetCart().then(()=>{
        this.contentRef.resize();
    });
  }
}
