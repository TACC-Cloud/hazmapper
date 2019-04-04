import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DropdownDirective, DropdownToggleDirective, DropdownMenuDirective} from './dropdown.directive';

@NgModule({
  declarations: [DropdownDirective, DropdownMenuDirective, DropdownToggleDirective],
  exports: [
    DropdownDirective,
    DropdownToggleDirective,
    DropdownMenuDirective
  ],
  imports: [
    CommonModule
  ]
})
export class DirectivesModule { }
