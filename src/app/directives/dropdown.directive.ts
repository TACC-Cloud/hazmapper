import {Directive, HostListener, ElementRef, Renderer2, ContentChild, Inject, forwardRef} from "@angular/core";

@Directive({
  selector: '[appDropdownMenu]'
})
export class DropdownMenuDirective {
  manageDropdown : boolean = false;
  constructor(private elementRef: ElementRef, private renderer: Renderer2)   {

  }

}

@Directive({
  selector: '[appDropdownToggle]',
  host: {
    '(click)': 'toggleOpen()',
  },
})
export class DropdownToggleDirective {
  constructor(@Inject(forwardRef(() => DropdownDirective)) public dropdown, elementRef: ElementRef<HTMLElement>) {

  }

  toggleOpen () {
    console.log("toggle open")
    this.dropdown.toggle();
  }
}

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective {
  manageDropdown : boolean = false;
  @ContentChild(DropdownMenuDirective) private _menu: DropdownMenuDirective;
  @ContentChild(DropdownMenuDirective, {read: ElementRef}) private _menuElement: ElementRef;
  @ContentChild(DropdownToggleDirective) private _toggle: DropdownToggleDirective;

  private isOpen : boolean = false;

  constructor(private elementRef: ElementRef, private renderer: Renderer2)   {

  }

  toggle() {
    console.log("toggle")
    this.isOpen =! this.isOpen;
    if (this.isOpen) {
      this.renderer.addClass(this._menuElement.nativeElement, 'is-open')
    } else {
      this.renderer.removeClass(this._menuElement.nativeElement, 'is-open')
    }
  }

}






