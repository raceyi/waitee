import { Component ,ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams,Content } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import * as hangul from 'hangul-js';
import { CartProvider } from '../../providers/cart/cart';
import {MenuPage} from '../menu/menu';

/**
 * Generated class for the MenuSearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-menu-search',
  templateUrl: 'menu-search.html',
})
export class MenuSearchPage {

 @ViewChild("homeContent") public contentRef: Content;
  shopInfo;
  menus=[];
  menuList=[];

  constructor(public navCtrl: NavController,
              public cartProvider:CartProvider,
              public storageProvider:StorageProvider, 
              public navParams: NavParams) {

    this.shopInfo=this.navParams.get("shopInfo");
    this.menuList=this.navParams.get("menus");
    console.log("menus:"+JSON.stringify(this.menus));
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
        for(let i=0;i<this.menuList.length;i++){
            if(this.checkInclude(this.menuList[i].menuName,val)){
                this.menus.push(this.menuList[i]);
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
    this.navCtrl.push(MenuPage, {menu:JSON.stringify(menu),
                                shopInfo:JSON.stringify(this.shopInfo),
                                class:"MenuPage"});
  }

  back(){
    this.navCtrl.pop( { animate: false });
  }
}
