import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { StorageProvider } from '../providers/storage/storage';

import { MyErrorHandler } from '../classes/my-error-handler';
import { ServerProvider } from '../providers/server/server';

import { HttpClientModule } from '@angular/common/http';
import { LoginProvider } from '../providers/login/login';
import {LoginPageModule} from '../pages/login/login.module';
import {ErrorPageModule} from '../pages/error/error.module';
import {SelectorPageModule} from '../pages/selector/selector.module';
import {SearchPageModule} from '../pages/search/search.module';
import{MenuListPageModule} from '../pages/menu-list/menu-list.module';
import {MenuPageModule} from '../pages/menu/menu.module';
import { NativeStorage } from '@ionic-native/native-storage';
import { HTTP } from '@ionic-native/http';
import {ComponentsModule} from '../components/components.module';
import { ConfigProvider } from '../providers/config/config';
import {OrderListPageModule} from '../pages/order-list/order-list.module';
import { CartProvider } from '../providers/cart/cart';
import {CashReceiptPageModule} from '../pages/cash-receipt/cash-receipt.module';
import {OrderReceiptPageModule} from '../pages/order-receipt/order-receipt.module';
import {OrderCheckPageModule} from '../pages/order-check/order-check.module';
import {ConfigurationPageModule} from '../pages/configuration/configuration.module';
import {CardExplainPageModule} from '../pages/card-explain/card-explain.module';
import {EngFilterPageModule} from '../pages/eng-filter/eng-filter.module';
import {EnMenuListPageModule} from '../pages/en-menu-list/en-menu-list.module';
import {EnMenuPageModule} from '../pages/en-menu/en-menu.module';
import { WebIntent } from '@ionic-native/web-intent';
import {EnSearchPageModule} from '../pages/en-search/en-search.module';
import {EnOrderListPageModule} from '../pages/en-order-list/en-order-list.module';
import {EnOrderReceiptPageModule} from '../pages/en-order-receipt/en-order-receipt.module';
import {EnOrderCheckPageModule} from '../pages/en-order-check/en-order-check.module';
import { Keyboard } from '@ionic-native/keyboard';

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    EnOrderCheckPageModule,
    EnOrderReceiptPageModule,
    EnOrderListPageModule,
    EnSearchPageModule,
    EnMenuPageModule,
    EnMenuListPageModule,
    EngFilterPageModule,
    CardExplainPageModule,
    ConfigurationPageModule,
    OrderCheckPageModule,
    OrderReceiptPageModule,
    CashReceiptPageModule,
    OrderListPageModule,
    MenuPageModule,
    ComponentsModule,
    MenuListPageModule,
    SearchPageModule,
    SelectorPageModule,
    ErrorPageModule,
    LoginPageModule,
    HttpClientModule,
    BrowserModule,
    //IonicModule.forRoot(MyApp)
    IonicModule.forRoot(MyApp,{mode:'ios',animate:false})
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    Keyboard,
    WebIntent,
    NativeStorage,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: MyErrorHandler},
    StorageProvider,
    ServerProvider,
    LoginProvider,
    HTTP,
    ConfigProvider,
    CartProvider
  ]
})
export class AppModule {}
