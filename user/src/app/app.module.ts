import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {LoginMainPageModule} from '../pages/login-main/login-main.module';
import {LoginEmailPageModule} from '../pages/login-email/login-email.module';

import { CustomIconsModule } from 'ionic2-custom-icons';
import {SignupPageModule} from '../pages/signup/signup.module';
import {SignupPaymentPageModule} from '../pages/signup-payment/signup-payment.module';
import {CashPasswordPageModule} from '../pages/cash-password/cash-password.module';

import {MyFavoritePageModule} from '../pages/my-favorite/my-favorite.module';
import {MyInfoPageModule} from '../pages/my-info/my-info.module';
import {OrderListPageModule} from '../pages/order-list/order-list.module';
import {WalletPageModule} from '../pages/wallet/wallet.module';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    TabsPage
  ],
  imports: [
    CustomIconsModule,
    BrowserModule,
    LoginMainPageModule,
    LoginEmailPageModule,
    SignupPageModule,
    SignupPaymentPageModule,
    CashPasswordPageModule,
    MyFavoritePageModule,
    MyInfoPageModule,
    OrderListPageModule,
    WalletPageModule,
    IonicModule.forRoot(MyApp,{mode:'ios'})
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,

    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
