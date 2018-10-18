import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {EnMenuListPage} from '../en-menu-list/en-menu-list';
import {StorageProvider} from '../../providers/storage/storage';
import { CartProvider } from '../../providers/cart/cart';
import {EnOrderCheckPage} from '../en-order-check/en-order-check';

/**
 * Generated class for the EngFilterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-eng-filter',
  templateUrl: 'eng-filter.html',
})
export class EngFilterPage {

/*
  beef:boolean=false;
  pork:boolean=false;
  fish:boolean=false;
  chicken:boolean=false;
  egg:boolean=false;
*/
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public cartProvider:CartProvider,
              public storage:StorageProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EngFilterPage');
  }

  ionViewWillUnload (){
        this.storage.resetFilter();
  }

  pop(){
    this.cartProvider.resetCart();
    this.navCtrl.pop();
  }

  select(material){
    if(material=='beef'){
        this.storage.filter.beef=true;
    }else if(material=='pork'){
        this.storage.filter.pork=true;
    }else if(material=='fish'){
        this.storage.filter.fish=true;
    }else if(material=='chicken'){
        this.storage.filter.chicken=true;
    }else if(material=='egg'){
        this.storage.filter.egg=true;
    }
  }

  unselect(material){
    if(material=='beef'){
        this.storage.filter.beef=false;
    }else if(material=='pork'){
        this.storage.filter.pork=false;
    }else if(material=='fish'){
        this.storage.filter.fish=false;
    }else if(material=='chicken'){
        this.storage.filter.chicken=false;
    }else if(material=='egg'){
        this.storage.filter.egg=false;
    }
  }  

  moveNextStep(){
    //save filter info into storageProvider
    this.cartProvider.resetCart();
    this.navCtrl.push(EnMenuListPage);
  }

   orderCheck(){
        this.navCtrl.push(EnOrderCheckPage);
  }
 
}
