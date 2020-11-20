import {Component, EventEmitter, Input, OnInit, Output, ElementRef, ViewChild} from '@angular/core';
import {ProjectsService} from '../../services/projects.service';
import {Project} from '../../models/models';

@Component({
  selector: 'app-edit-name-input',
  templateUrl: './edit-name-input.component.html',
  styleUrls: ['./edit-name-input.component.styl']
})
export class EditNameInputComponent implements OnInit {
  @Input() inputType: string;
  @Input() currentName: string;
  @Input() errorMessage: string;
  @Input() inputError: boolean = false;
  @Output() nameChange: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('activeText', {static: false}) activeInput: ElementRef<HTMLInputElement>;

  activeProject: Project;

  inputShown: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  onEnter(value: string) {
    value = value.trim();
    if (value && value != this.currentName) {
      this.nameChange.next(value);
    }

    this.hideInput();
  }

  // NOTE: Unless we have the delay, the input is not drawn
  //       in time for the focusmethod.
  //       This is for focusing input on activation.
  showInput() {
    this.inputShown = true;
    setTimeout(() => {
      this.activeInput.nativeElement.value = this.currentName;
      this.activeInput.nativeElement.focus()
      this.activeInput.nativeElement.select()
    }, 1);
  }

  hideInput() {
    this.inputShown = false;
  }
}
