import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,App } from 'ionic-angular';
import {ConfigurePasswordPage} from '../configure-password/configure-password';
import {StorageProvider} from '../../providers/storage/storage';

/**
 * Generated class for the UserinfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-userinfo',
  templateUrl: 'userinfo.html',
})
export class UserinfoPage {

  constructor(public navCtrl: NavController, 
              private app:App,
              public storageProvider:StorageProvider,
              public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserinfoPage');
  }

  modifyPassword(){
         this.app.getRootNavs()[0].push(ConfigurePasswordPage);
  }
}
