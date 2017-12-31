import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,App} from 'ionic-angular';
import { LoginEmailPage } from '../login-email/login-email';

/**
 * Generated class for the LoginMainPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login-main',
  templateUrl: 'login-main.html',
})
export class LoginMainPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,private app:App) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginMainPage');
  }

  emaillogin(){
    this.app.getRootNavs()[0].push(LoginEmailPage);
  }
}
