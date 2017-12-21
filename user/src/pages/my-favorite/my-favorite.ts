import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the MyFavoritePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my-favorite',
  templateUrl: 'my-favorite.html',
})
export class MyFavoritePage {
  shops=[];
  menus=[];
  awsS3:string="assets/imgs/";

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.shops=[ {takitId:"더큰도시락@세종대학교",
                            name_sub:"세종대학교",
                            name_main:"더큰도시락",
                            classification:"한식",
                            star_rating:4.8},
                 {takitId:"그릿스테이크@서울창업허브",
                            name_sub:"서울창업허브",
                            name_main:"그릿 스테이크",
                            classification:"양식",
                            star_rating:4.8},
                 {takitId:"더큰도시락@세종대학교",
                            name_sub:"세종대학교",
                            name_main:"더큰도시락",
                            classification:"한식",
                            star_rating:4.8},
                 {takitId:"그릿스테이크@서울창업허브",
                            name_sub:"서울창업허브",
                            name_main:"그릿 스테이크",
                            classification:"양식",
                            star_rating:4.8}];

    this.menus=[{takitId:"더큰도시락@세종대학교",
                            name_sub:"세종대학교",
                            name_main:"더큰도시락",
                            menuName:"제육김치덮밥",
                            imagePath:"menu.png",
                            price:3600},
                {takitId:"더큰도시락@세종대학교",
                            name_sub:"세종대학교",
                            name_main:"더큰도시락",
                            menuName:"제육김치덮밥",
                            imagePath:"menu.png",
                            //imagePath:"세종대@더큰도시락;6_제육김치덮밥.png",
                            price:3600},
                {takitId:"더큰도시락@세종대학교",
                            name_sub:"세종대학교",
                            name_main:"더큰도시락",
                            menuName:"제육김치덮밥",
                            imagePath:"menu.png",
                            //imagePath:"세종대@더큰도시락;6_제육김치덮밥.png",
                            price:3600},
                {takitId:"더큰도시락@세종대학교",
                            name_sub:"세종대학교",
                            name_main:"더큰도시락",
                            menuName:"제육김치덮밥",
                            imagePath:"menu.png",
                            //imagePath:"세종대@더큰도시락;6_제육김치덮밥.png",
                            price:3600}];

    this.shops.forEach(shop => {
      shop.imagePath=this.awsS3+shop.takitId;
    });

    this.menus.forEach(menu => {
      menu.fullImagePath=this.awsS3+menu.imagePath;
    });                        
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MyFavoritePage');
  }

}
