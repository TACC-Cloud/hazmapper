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
  constructor(@Inject(forwardRef(() => DropdownDirective)) public dropdown) {

  }

  toggleOpen () {
    this.dropdown.toggle();
  }
}

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective {
  @ContentChild(DropdownMenuDirective, {static: true, read: ElementRef}) private _menu: DropdownMenuDirective;
  @ContentChild(DropdownMenuDirective, {static: true, read: ElementRef}) private _menuElement: ElementRef;
  @ContentChild(DropdownToggleDirective, {static: true, read: ElementRef}) private _toggle: DropdownToggleDirective;

  private isOpen : boolean = false;

  constructor(private elementRef: ElementRef, private renderer: Renderer2)   {

  }
  @HostListener('document:click', ['$event.target'])
    public onClick(targetElement) {
        const clickedInside = this.elementRef.nativeElement.contains(targetElement);
        if (!clickedInside && this.isOpen) {
            this.toggle();
        }
    }
  toggle() {
    this.isOpen =! this.isOpen;
    if (this.isOpen) {
      this.renderer.addClass(this._menuElement.nativeElement, 'is-open')
    } else {
      this.renderer.removeClass(this._menuElement.nativeElement, 'is-open')
    }
  }

}






