import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Platform } from 'ionic-angular';

/**
 * Generated class for the ErrorPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-error',
  templateUrl: 'error.html',
})
export class ErrorPage {
  isAndroid;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private platform: Platform) {
        this.isAndroid=platform.is("android");        
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ErrorPage');
    this.isAndroid=this.platform.is("android");        
  }

}
