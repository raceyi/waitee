import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import {LoginMainPage} from '../pages/login-main/login-main';
import {SignupPage} from '../pages/signup/signup';
import {SignupPaymentPage} from '../pages/signup-payment/signup-payment';
import {CashPasswordPage} from '../pages/cash-password/cash-password';
import {ShopPage} from '../pages/shop/shop';
import {SearchPage} from '../pages/search/search';
import {CashConfirmPage} from '../pages/cash-confirm/cash-confirm';

import {CashRefundMainPage} from  '../pages/cash-refund-main/cash-refund-main';
import {CashRefundAccountPage} from '../pages/cash-refund-account/cash-refund-account';
import {CashChargePage} from '../pages/cash-charge/cash-charge';
import {PaymentPage} from '../pages/payment/payment';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  //rootPage:any = CashConfirmPage;
  //rootPage:any = CashRefundAccountPage;
  //rootPage:any = CashRefundMainPage;
  //rootPage:any =PaymentPage;
  //rootPage:any = TabsPage;
  rootPage:any = LoginMainPage;
  //rootPage:any = SignupPaymentPage;
  //rootPage:any=CashPasswordPage;
  //rootPage:any = ShopPage
  //rootPage:any=SearchPage;
  //rootPage:any=CashChargePage;
  
  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}