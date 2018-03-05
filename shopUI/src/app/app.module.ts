import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import {UserinfoPageModule} from '../pages/userinfo/userinfo.module';
import {ConfigurePasswordPageModule} from '../pages/configure-password/configure-password.module';
import {ShopInfoPageModule} from '../pages/shop-info/shop-info.module';
import {ShoptablePageModule} from '../pages/shoptable/shoptable.module';

import { StorageProvider } from '../providers/storage/storage';
import { HttpClientModule } from '@angular/common/http';
import {ComponentsModule} from '../components/components.module';

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    UserinfoPageModule,
    ConfigurePasswordPageModule,
    ShopInfoPageModule,
    ShoptablePageModule,
    ComponentsModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp,{mode:'ios'})    
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    StorageProvider
  ]
})
export class AppModule {}
