import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  recommendations=[];
  recently_visited_shop=[];
  awsS3:string="assets/imgs/";
  shops=[];
  overlayHidden:boolean=true;
  searchShop:string=" ";
  shouldShowCancel:boolean=true;

  constructor(public navCtrl: NavController) {
    this.shops=[ "세종대 더큰도시락","세종대 헨델과그레텔","세종대 카페드림","서울창업허브 그릿스테이크"];
    // shop에 추가되어야할 필드: name_sub, name_main, classification, star_rating 
    this.recommendations=[ {takitId:"더큰도시락@세종대학교",
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
                            star_rating:4.8} ];

    this.recently_visited_shop=[{takitId:"더큰도시락@세종대학교",
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
                            star_rating:4.8} ];     
    //Just for testing                                               
    this.recently_visited_shop.forEach(shop => {
      shop.imagePath=this.awsS3+"shop.png";
    });               
    this.recommendations.forEach(shop => {
      shop.imagePath=this.awsS3+"shop.png";
    });               
                 
  }

  getShops(ev:any){
    let val = ev.target.value;
    if (val && val.trim() != '') {
        this.shops = this.shops.filter((item) => {
        return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

  showSearchBar(){
      this.overlayHidden=false;
  }

  onCancel(ev:any){
      this.overlayHidden=true;
  }

}
