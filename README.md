# waitee

LICENSE: GPL

$ionic start user tabs

$cd user => config.xml의 id,name 수정 splash 관련 사항 추가 

    <widget id="biz.takitApp.user" ...>
    <name>웨이티</name>
    ...
    <preference name="orientation" value="portrait" />
    <preference name="CordovaWebViewEngine" value="CDVUIWebViewEngine" />

$ionic cordova platform add android

$ionic cordova platform add android@7.1.0

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

platforms/ios/ios.json에서 remote-notification을 검색하여 audio play를 삭제함

*download kakao plugin and install it from local storage

*https://github.com/taejaehan/Cordova-Kakaotalk-Plugin 참조해 작업하기 

$ionic cordova plugin add ../ --variable KAKAO_APP_KEY={takitUser.kakao.appId}

$ionic cordova plugin add cordova-plugin-facebook4 --save --variable APP_ID="{takitUser.facebook.appId}" --variable APP_NAME="waitee"

$npm install --save @ionic-native/facebook

$cp ../google-services.json .

$cp ../GoogleService-Info.plist .

config.xml 편집

    <platform name="android">
        
        <resource-file src="google-services.json" target="google-services.json" />

    <platform name="ios">

        <resource-file src="GoogleService-Info.plist" />


$ionic cordova plugin add phonegap-plugin-push

$npm install --save @ionic-native/push

$ info list에 kakao와 toss추가, kakao framework추가하기, beep.wav수정하기 

* 장바구니

$ionic cordova plugin add cordova-sqlite-storage

$npm install --save @ionic-native/sqlite

*토스 연동

$ionic cordova plugin add com-darryncampbell-cordova-plugin-intent

$npm install --save @ionic-native/web-intent

*custom-icon 

$npm install ionic2-custom-icons --save

package.json 수정

* 그외

$npm install moment --save

$ionic cordova plugin add cordova-clipboard

$git checkout user/resources/icon.png

$git checkout user/resources/splash.png

$ionic cordova resources

src/assets복사하기

pages/contact,about 삭제하기 
=======================================================================================

$ionic start shop blank

config.xml의 id,name 수정

     <widget id="biz.takitApp.shop" ...>
     <name>웨이티상점</name>
     ...
     <preference name="orientation" value="portrait" />

$ionic cordova platform add android@latest

$ionic cordova platform add ios

$ionic cordova plugin add phonegap-plugin-push   ===> PushInstanceIDListenerService.java를수정한다.

$npm install --save @ionic-native/push

<variable name="SENDER_ID" value="986862676163" />        ===> config.xml에 추가하기 

$ionic cordova plugin add cordova-plugin-media            ===>enforce cordova-plugin-file@6.0.1

$npm install --save @ionic-native/media

$ionic cordova plugin add cordova-plugin-network-information

$npm install --save @ionic-native/network

$ionic cordova plugin add --force cordova-plugin-file-transfer   ===>enforce cordova-plugin-file@5.0.0

$npm install --save @ionic-native/transfer

$ionic cordova plugin add cordova-plugin-camera

$npm install --save @ionic-native/camera

$ionic cordova plugin add cordova-plugin-filepath

$npm install --save @ionic-native/file-path

$ionic cordova plugin add ../btprinterplugin/BtPrinter/

$ionic cordova plugin add https://github.com/katzer/cordova-plugin-background-mode

$npm install --save @ionic-native/background-mode

$ionic cordova plugin add cordova-plugin-nativestorage

$npm install --save @ionic-native/native-storage

$npm install crypto-js

$npm install @types/crypto-js --save

$npm install ng-socket-io --save

$npm install moment --save

$npm install --save @ionic-native/file

$ionic cordova build ios

$ionic cordova build android

$ionic cordova plugin add cordova-plugin-tts

$npm install --save @ionic-native/text-to-speech

$ionic cordova plugin add cordova-plugin-volume-control

$ionic cordova plugin add 

$ionic cordova plugin add cordova-plugin-advanced-http

$npm install --save @ionic-native/http

$npm install ionic2-custom-icons --save

platforms/android/app/src/main/res/raw 에 mp3파일 복사
assets파일 복사

platforms/android/app/libs에 bt.command.sdk.jar	btsdk.jar 복사

/src/pages/home삭제

icons 디렉토리에 복사 

kiosk


notifier
config.xml에 id와 이름 수정
id:biz.takit.notifier
name: 소리알림

$ionic start notifier blank 

$ionic cordova platform add android

$ionic cordova plugin add https://github.com/MobileChromeApps/cordova-plugin-chrome-apps-sockets-tcpServer

$ionic cordova plugin add cordova-plugin-networkinterface

$ionic cordova plugin add https://github.com/leecrossley/cordova-plugin-boot-launcher 

BootLauncher.java에 biz.takit.notifier.MainActivity.class 수정

$ionic cordova plugin add cordova-plugin-background-mode

$npm install --save @ionic-native/background-mode

$ionic cordova plugin add cordova-plugin-media

$npm install --save @ionic-native/media

$ionic cordova plugin add cordova-plugin-tts

$npm install --save @ionic-native/text-to-speech

kiosk

$ionic cordova plugin add ../wifiprinterplugin/WifiPrinter/

$ionic cordova plugin add cordova-plugin-nativestorage

$npm install --save @ionic-native/native-storage

$npm install crypto-js

$npm install @types/crypto-js --save

$npm install hangul-js

$ionic cordova plugin add com-darryncampbell-cordova-plugin-intent

$npm install --save @ionic-native/web-intent

$ionic cordova plugin add cordova-plugin-customurlscheme --variable URL_SCHEME=waitee

$ionic cordova plugin add com-darryncampbell-cordova-plugin-intent

$npm install --save @ionic-native/web-intent


