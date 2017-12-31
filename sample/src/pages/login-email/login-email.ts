import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,App } from 'ionic-angular';
import { SignupPage } from '../signup/signup';
import { PasswordResetPage} from '../password-reset/password-reset';
import {LoginMainPage} from '../login-main/login-main';
/**
 * Generated class for the LoginEmailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login-email',
  templateUrl: 'login-email.html',
})
export class LoginEmailPage {
  email:string;
  password:string;

  constructor(public navCtrl: NavController, public navParams: NavParams,private app:App) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginEmailPage');
  }

  emailReset(){
      this.app.getRootNavs()[0].push(PasswordResetPage);
  }

  emailLogin(){
    
  }

  signup(){
    this.app.getRootNavs()[0].push(SignupPage);
  }

  back(){
        this.navCtrl.pop();
  }
}
