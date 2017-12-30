import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,App } from 'ionic-angular';
import { PolicyPage} from  '../policy/policy';

/**
 * Generated class for the MyInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my-info',
  templateUrl: 'my-info.html',
})
export class MyInfoPage {
  user={name:'김다현', email:'xxxxxx.kim@gmail.com'}
  
  constructor(public navCtrl: NavController, public navParams: NavParams,private app: App) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MyInfoPage');
  }

  goToPolicy(){
    this.app.getRootNavs()[0].push(PolicyPage);
  }
}
