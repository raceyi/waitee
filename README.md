# waitee

LICENSE: GPL

$ionic start user tabs

$cd user => config.xml의 id,name 수정 splash 관련 사항 추가 

    <widget id="biz.takitApp.user" ...>
    <name>웨이티</name>
    ...
    <preference name="orientation" value="portrait" />

$ionic cordova platform add android

$ionic cordova platform add ios

* login

$ionic cordova plugin add cordova-plugin-network-information

$npm install --save @ionic-native/network

$ionic cordova plugin add https://github.com/loicknuchel/cordova-device-accounts.git

$ionic cordova plugin add cordova-plugin-android-permissions

$ionic cordova plugin add cordova-plugin-nativestorage

$npm install --save @ionic-native/native-storage

$npm install crypto-js

$npm install @types/crypto-js --save

$ionic cordova plugin add cordova-plugin-inappbrowser@1.7.2

$npm install --save @ionic-native/in-app-browser

$ionic cordova plugin add cordova-plugin-appavailability

$npm install --save @ionic-native/app-availability

$ionic cordova plugin add https://github.com/katzer/cordova-plugin-background-mode

$npm install --save @ionic-native/background-mode

*download kakao plugin and install it from local storage

$ionic cordova plugin add ../ --variable KAKAO_APP_KEY={takitUser.kakao.appId}

$ionic cordova plugin add cordova-plugin-facebook4 --save --variable APP_ID="{takitUser.facebook.appId}" --variable APP_NAME="waitee"

$npm install --save @ionic-native/facebook

* 장바구니

$ionic cordova plugin add cordova-sqlite-storage

$npm install --save @ionic-native/sqlite

* 그외

$npm install moment --save

$ionic cordova plugin add cordova-clipboard

$git checkout user/resources/icon.png

$git checkout user/resources/splash.png

$ionic cordova resources

=======================================================================================

$ionic start shop blank

config.xml의 id,name 수정

     <widget id="biz.takitApp.shop" ...>
     <name>웨이티상점</name>
     ...

$ionic cordova platform add android

$ionic cordova platform add ios

$ionic cordova plugin add cordova-plugin-network-information

$npm install --save @ionic-native/network

$ionic cordova plugin add cordova-plugin-file-transfer

$npm install --save @ionic-native/transfer

$ionic cordova plugin add cordova-plugin-camera

$npm install --save @ionic-native/camera

$ionic cordova plugin add cordova-plugin-file

$npm install --save @ionic-native/file

$ionic cordova plugin add cordova-plugin-filepath

$npm install --save @ionic-native/file-path

$ionic cordova plugin add https://github.com/atmosuwiryo/Cordova-Plugin-Bluetooth-Printer

$ionic cordova plugin add https://github.com/katzer/cordova-plugin-background-mode

$npm install --save @ionic-native/background-mode

$ionic cordova plugin add cordova-plugin-media

$npm install --save @ionic-native/media

$ionic cordova plugin add cordova-plugin-nativestorage

$npm install --save @ionic-native/native-storage

$npm install crypto-js

$npm install @types/crypto-js --save

$ionic cordova build ios

$ionic cordova build android


