import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the StorageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageProvider {
  public isTestServer=false;
  public tourMode=false;
  public myshoplist=[{"takitId":"TEST2@TAKIT","manager":true,"GCMNoti":"on"},{"takitId":"세종대@더큰도시락","manager":true,"GCMNoti":"off"}];
  public myshop:any={"takitId":"세종대@더큰도시락","manager":true,"GCMNoti":"off"};
  public email="help@takit.biz"; 
  public phone="05051703636";
  public name="타킷주식회사";
  public storeOpen:boolean=true;
  public shopInfo={shopName:"더큰도시락"};

  constructor(public http: HttpClient) {
    console.log('Hello StorageProvider Provider');
  }

}
