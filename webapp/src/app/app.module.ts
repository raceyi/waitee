import { NgModule,ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import {EmailProvider} from '../providers/LoginProvider/email-provider';
import {StorageProvider} from '../providers/storageProvider';
import { IonicStorageModule } from '@ionic/storage';
import { NativeStorage } from '@ionic-native/native-storage';
import {ServerProvider} from '../providers/serverProvider';
import {ConfigProvider} from '../providers/configProvider';

import { Storage } from '@ionic/storage';
import {LoginPage} from '../pages/login/login';
import {ErrorPageModule} from '../pages/error/error.module';
import {SelectorPage} from '../pages/selector/selector';
import {ShopTablePage} from '../pages/shoptable/shoptable';
import {UserSecretPage} from '../pages/usersecret/usersecret';
import {ServiceInfoPage} from '../pages/serviceinfo/serviceinfo';
import {CashPage} from '../pages/cash/cash';
import {UserInfoPage} from '../pages/userinfo/userinfo';
import {SalesPage} from '../pages/sales-page/sales-page';
import { EditMenuPage } from '../pages/edit-menu-page/edit-menu-page';
import { MenuModalPage} from '../pages/menu-modal-page/menu-modal-page';

import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';

import { Media, MediaObject } from '@ionic-native/media';
import { HttpModule } from '@angular/http';

import { MyErrorHandler } from '../classes/my-error-handler';
import {CancelConfirmPageModule} from '../pages/cancel-confirm/cancel-confirm.module';
import { SoldOutPageModule } from '../pages/sold-out/sold-out.module';
import {ComponentsModule} from '../components/components.module';
import {ConfigurePasswordPageModule} from '../pages/configure-password/configure-password.module';
import {ConfigurePageModule} from '../pages/configure/configure.module';
import {KioskSalesPageModule} from '../pages/kiosk-sales/kiosk-sales.module';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    SelectorPage,
    ShopTablePage,
    UserSecretPage,
    ServiceInfoPage,
    CashPage,
    UserInfoPage,
    SalesPage,
    EditMenuPage,
    MenuModalPage,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp,{mode:'ios'}),
    IonicStorageModule.forRoot(),
    CancelConfirmPageModule,
    ErrorPageModule,
    ComponentsModule,
    SoldOutPageModule,
    ConfigurePageModule,
    ConfigurePasswordPageModule,
    KioskSalesPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    SelectorPage,
    ShopTablePage,
    UserSecretPage,
    ServiceInfoPage,
    CashPage,
    UserInfoPage,
    SalesPage,
    EditMenuPage,
    MenuModalPage
  ],
  providers: [{provide: ErrorHandler, useClass: MyErrorHandler},
//    Network, 
    SplashScreen,
    StatusBar, 
//    Media,
    Camera,
    FileTransfer,
    File,
    NativeStorage,
    EmailProvider,
    ConfigProvider,
    StorageProvider,
//    MediaProvider,
    ServerProvider,
    ]
})
export class AppModule {}
