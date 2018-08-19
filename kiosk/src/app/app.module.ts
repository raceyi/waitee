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

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    MenuPageModule,
    ComponentsModule,
    MenuListPageModule,
    SearchPageModule,
    SelectorPageModule,
    ErrorPageModule,
    LoginPageModule,
    HttpClientModule,
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    NativeStorage,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: MyErrorHandler},
    StorageProvider,
    ServerProvider,
    LoginProvider,
    HTTP,
    ConfigProvider
  ]
})
export class AppModule {}
