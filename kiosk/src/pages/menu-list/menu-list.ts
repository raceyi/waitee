import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {SearchPage} from '../search/search';
import {MenuPage} from '../menu/menu';
import { CartProvider } from '../../providers/cart/cart';
import {OrderListPage} from '../order-list/order-list';

/**
 * Generated class for the MenuListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-menu-list',
  templateUrl: 'menu-list.html',
})
export class MenuListPage {
  categories;
  menus;
  categorySelected;
  nowMenus;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public cartProvider:CartProvider,
              public storageProvider:StorageProvider) {
      this.categories=storageProvider.categories;
      this.categorySelected=this.navParams.get("categoryIndex");
      //console.log("categories:"+JSON.stringify(this.categories));

      this.nowMenus=this.categories[this.categorySelected].menus;
      this.menus=[];
        for(var i=0;i<this.nowMenus.length/2;i++){
           let pair=[];
           pair.push(this.nowMenus[i*2]);
           pair.push(this.nowMenus[i*2+1]);
           this.menus.push(pair);
           console.log("i:"+i);
        }     
      console.log("menus:"+JSON.stringify(this.menus[0][0].soldout));
      //this.menus[0][0].soldout=1; Just for testing
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MenuListPage');
  }

categoryClick(sequence){
    console.log("[categoryChange] sequence:"+sequence+" previous:"+this.categorySelected);
    console.log("sequence type:"+typeof sequence+"categorySelected type:"+typeof this.categorySelected)
        this.nowMenus=this.categories[sequence].menus;
        this.menus=[];
        for(var i=0;i<this.nowMenus.length/2;i++){
           let pair=[];
           pair.push(this.nowMenus[i*2]);
           pair.push(this.nowMenus[i*2+1]);
           this.menus.push(pair);
           console.log("i:"+i);
        }       
        this.categorySelected=sequence; 
    console.log("categorySelected:"+this.categorySelected);
  }

  configureButtonColor(i){
     if(i==this.categorySelected)
          return '#FF5F3A';
      else
          return '#000000';    
  }

  configureButtonBackgroundColor(i){
   if(i==this.categorySelected)
          return '#f4f4f4';
      else
          return '#ffffff';    
  }

  back(){
    this.navCtrl.pop();
  }

  search(){
    this.navCtrl.push(SearchPage,{class:"SearchPage"});
  }

  selectMenu(menu){
    console.log("selectMenu");
    this.navCtrl.push(MenuPage,{menu:menu,class:"MenuPage"});
  }

   moveOrderList(){
    this.navCtrl.push(OrderListPage,{class:"OrderListPage"});
  }

 split1(string:string){
      let substrs=string.split(" ");
      let sum=0,i=0;
      for(i=0;i<substrs.length;i++){
          sum+=substrs[i].length;
          if(sum>12)
             break;
      }
      let lines="";
      if(i==0){ // 스페이스 상관없이 두라인으로 표기함
           //lines=string.substr(0,12)+"<br>"+string.substr(12);
          lines=string.substr(0,12)+string.substr(12);           
      }else{
          let j=0;
          for(j=0;j<i;j++)
              lines+=substrs[j]+" ";
      }
      return lines;
  }

  split2(string:string){
      let substrs=string.split(" ");
      let sum=0,i=0;
      for(i=0;i<substrs.length;i++){
          sum+=substrs[i].length;
          if(sum>12)
             break;
      }
      let lines="";
      if(i==0){ // 스페이스 상관없이 두라인으로 표기함
           lines=string.substr(12);
      }else{
          for(let j=i;j<substrs.length;j++)
              lines+=substrs[j];
      }
      return lines;
  }
}
