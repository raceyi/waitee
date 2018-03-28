import { NgModule } from '@angular/core';
import { AmountDisplayComponent } from './amount-display/amount-display';
import { IonicModule } from 'ionic-angular';
@NgModule({
	declarations: [AmountDisplayComponent],
	imports: [IonicModule],
	exports: [AmountDisplayComponent]
})
export class ComponentsModule {}
