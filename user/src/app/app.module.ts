import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import {Facebook, FacebookLoginResponse} from '@ionic-native/facebook';

import {MyErrorHandler} from '../classes/my-error-handler';
import { LoginProvider } from '../providers/login/login';
import { ConfigProvider } from '../providers/config/config';
import { StorageProvider } from '../providers/storage/storage';
import { NativeStorage } from '@ionic-native/native-storage';

import { AppAvailability } from '@ionic-native/app-availability';
import { InAppBrowser,InAppBrowserEvent } from '@ionic-native/in-app-browser';
import { HttpClientModule } from '@angular/common/http';
import { BackgroundMode } from '@ionic-native/background-mode';

import { CustomIconsModule } from 'ionic2-custom-icons';

import {LoginMainPageModule} from '../pages/login-main/login-main.module';
import {LoginEmailPageModule} from '../pages/login-email/login-email.module';

import {SignupPageModule} from '../pages/signup/signup.module';
import {SignupPaymentPageModule} from '../pages/signup-payment/signup-payment.module';
import {CashPasswordPageModule} from '../pages/cash-password/cash-password.module';

import {MyFavoritePageModule} from '../pages/my-favorite/my-favorite.module';
import {MyInfoPageModule} from '../pages/my-info/my-info.module';
import {OrderListPageModule} from '../pages/order-list/order-list.module';
import {WalletPageModule} from '../pages/wallet/wallet.module';
import {ShopPageModule} from '../pages/shop/shop.module';
import {MenuPageModule} from '../pages/menu/menu.module';
import {SearchPageModule} from '../pages/search/search.module';
import {PolicyPageModule} from '../pages/policy/policy.module';
import {FaqPageModule} from '../pages/faq/faq.module';

import {CartPageModule} from '../pages/cart/cart.module';
import {CompanyInfoPageModule} from '../pages/company-info/company-info.module';
import {PolicyDetailPageModule} from '../pages/policy-detail/policy-detail.module';
import {PasswordResetPageModule} from '../pages/password-reset/password-reset.module';
import {CashCancelChargePageModule} from '../pages/cash-cancel-charge/cash-cancel-charge.module';
import {CashConfirmPageModule} from '../pages/cash-confirm/cash-confirm.module';
import {CashRefundMainPageModule} from  '../pages/cash-refund-main/cash-refund-main.module';
import {CashRefundAccountPageModule} from '../pages/cash-refund-account/cash-refund-account.module';
import {ReviewInputPageModule} from '../pages/review-input/review-input.module';
import {OrderDetailPageModule} from '../pages/order-detail/order-detail.module';
import {CashChargePageModule} from '../pages/cash-charge/cash-charge.module';
import {CashManualConfirmPageModule} from '../pages/cash-manual-confirm/cash-manual-confirm.module';
import{PaymentPageModule} from '../pages/payment/payment.module';
import {ErrorPageModule} from '../pages/error/error.module';
import { ServerProvider } from '../providers/server/server';
import { Network } from '@ionic-native/network';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import {CashTutorialPageModule} from '../pages/cash-tutorial/cash-tutorial.module';
import { CardProvider } from '../providers/card/card';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { CartProvider } from '../providers/cart/cart';
import {ConfigureReceiptPageModule} from '../pages/configure-receipt/configure-receipt.module';
import {ConfigurePasswordPageModule} from '../pages/configure-password/configure-password.module';
import {ConfigurePaymentPageModule} from '../pages/configure-payment/configure-payment.module';
import {InputCouponPageModule} from '../pages/input-coupon/input-coupon.module';
import {ComponentsModule} from '../components/components.module';
import {TossTransferPageModule} from '../pages/toss-transfer/toss-transfer.module';
import { WebIntent } from '@ionic-native/web-intent';
import {StoreSearchPageModule} from '../pages/store-search/store-search.module';
import { Media, MediaObject } from '@ionic-native/media';
import {MenuSearchPageModule} from '../pages/menu-search/menu-search.module';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    TabsPage    
  ],
  imports: [
    ComponentsModule,
    MenuSearchPageModule,
    LoginMainPageModule,
    LoginEmailPageModule,
    SignupPageModule,
    SignupPaymentPageModule,
    CashPasswordPageModule,
    MyFavoritePageModule,
    MyInfoPageModule,
    OrderListPageModule,
    WalletPageModule,
    ShopPageModule,
    MenuPageModule,
    SearchPageModule,
    PolicyPageModule,
    FaqPageModule,
    CompanyInfoPageModule,
    PolicyDetailPageModule,
    PasswordResetPageModule,
    CashConfirmPageModule,
    CashRefundMainPageModule,
    CashRefundAccountPageModule,
    ReviewInputPageModule,
    OrderDetailPageModule,
    CashChargePageModule,
    CashManualConfirmPageModule,
    PaymentPageModule,    
    LoginMainPageModule,
    CartPageModule,
    CustomIconsModule,
    HttpClientModule,
    BrowserModule,
    ErrorPageModule,
    CashTutorialPageModule,
    ConfigureReceiptPageModule,
    ConfigurePasswordPageModule,
    ConfigurePaymentPageModule,  
    CashCancelChargePageModule,  
    InputCouponPageModule,
    TossTransferPageModule,
    StoreSearchPageModule,
    IonicModule.forRoot(MyApp,{mode:'ios'})
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    TabsPage    
  ],
  providers: [
    Media,
    Network, 
    ConfigProvider,
    NativeStorage,
    SQLite,
    StorageProvider,
    LoginProvider,
    Facebook,
    StatusBar,
    SplashScreen,
    AppAvailability,
    InAppBrowser,
    BackgroundMode,
    Push,
    {provide: ErrorHandler, useClass: MyErrorHandler},
    ServerProvider,
    CardProvider,
    CartProvider,
    WebIntent
  ]
})
export class AppModule {}
