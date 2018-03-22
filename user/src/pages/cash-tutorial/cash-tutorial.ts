import { Component ,ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams,Slides } from 'ionic-angular';

/**
 * Generated class for the CashTutorialPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cash-tutorial',
  templateUrl: 'cash-tutorial.html',
})
export class CashTutorialPage {

@ViewChild(Slides) slides: Slides;
    currentIndex=0;

    tutorials = [{img:'assets/imgs/cashGuideImg/cashGuide1.png', title:"온라인 계좌이체", 
                    contents:"고객님의 충전힌트를 받는통장표시 내용에 입력해주세요 대소문자 구분은 없으며 1회 10만원 이하의 금액만 충전가능합니다."},
    {img:'assets/imgs/cashGuideImg/cashGuide2.png', title:"입금 확인 / 충전완료",
      contents:"이체 후 15초 내로 오는 입금 확인 알림의 법적 고지에 동의하시면 충전이 됩니다."},
    {img:'assets/imgs/cashGuideImg/cashGuide3.png', title:"입금확인 대기중",
      contents:"네트워크 상황에 따라 입금 확인 알람이 전달되지 않을 수 있습니다. 지갑 탭에서 ‘입금확인대기중!’을 눌러 충전가능합니다."},
    {img:'assets/imgs/cashGuideImg/cashGuide4.png',title:"입금 수동 확인",
      contents:"지갑 탭의 충전에서 ‘충전 힌트 입력을 잊으셨나요?’를 클릭 후 이체정보를 채워주세요. 통장 표시내용은 본인의 실명입니다."}];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CashTutorialPage');
  }

 slideChanged(){
      this.currentIndex = this.slides.getActiveIndex();
 }

 back(){
   this.navCtrl.pop();
 }
}
