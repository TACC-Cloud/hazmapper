import { Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {ProjectsService} from '../../services/projects.service';
import {ModalService} from '../../services/modal.service';
import {IProjectUser} from '../../models/project-user';
import {FormGroup, FormControl} from '@angular/forms';
import {Project} from '../../models/models';

@Component({
  selector: 'app-users-panel',
  templateUrl: './users-panel.component.html',
  styleUrls: ['./users-panel.component.styl']
})
export class UsersPanelComponent implements OnInit {

  public projectUsers: Array<IProjectUser>;
  addUserForm: FormGroup;
  activeProject: Project;
  nameInputShown: boolean = false;
  descriptionInputShown: boolean = false;
  nameInputError: boolean = false;
  descriptionInputError: boolean = false;
  nameErrorMessage: string = "Project name must be under 512 characters!";
  descriptionErrorMessage: string = "Project description must be under 4096 characters!";
  @ViewChild('activeProjectName', {static: false}) projectNameInput: ElementRef<HTMLInputElement>;
  @ViewChild('activeProjectDescription', {static: false}) projectDescriptionInput: ElementRef<HTMLInputElement>;

  constructor(private projectsService: ProjectsService, private modalService: ModalService) { }


  ngOnInit() {

    this.addUserForm = new FormGroup( {
      username: new FormControl()
    });

    this.projectsService.activeProject.subscribe( (next) => {
      this.activeProject = next;
    });

    this.projectsService.projectUsers$.subscribe( (next) => {
      this.projectUsers = next;
    });
  }

  deleteProject() {
    this.modalService.confirm(
      'Delete map',
      'Are you sure you want to delete this map?  All associated features and metadata will be deleted. THIS CANNOT BE UNDONE.',
      ['Cancel', 'Delete']).subscribe( (answer) => {
        if(answer === 'Delete') {
          this.projectsService.deleteProject(this.activeProject);
        }
    });
  }

  addUser() {
    this.projectsService.addUserToProject(this.activeProject, this.addUserForm.get('username').value);
  }

  changeProjectName(name: string) {
    if (name.length < 512) {
      this.nameInputError = false;
      this.activeProject.name = name;
      this.projectsService.updateProject(this.activeProject, name, undefined);

    } else {
      this.nameInputError = true;
    }
  }

  changeProjectDescription(description: string) {
    if (description.length < 4096) {
      this.descriptionInputError = false;
      this.activeProject.description = description;
      this.projectsService.updateProject(this.activeProject, undefined, description);
    } else {
      this.descriptionInputError = true;
    }
  }

  hideNameInput() {
    this.nameInputShown = false;
  }

  // NOTE: Unless we have the delay, the input is not drawn
  //       in time for the focusmethod.
  showNameInput() {
    this.nameInputShown = true;
    setTimeout(() => {
      this.projectNameInput.nativeElement.value = this.activeProject.name;
      this.projectNameInput.nativeElement.focus()
      this.projectNameInput.nativeElement.select()
    }, 1);
  }

  hideDescriptionInput() {
    this.descriptionInputShown = false;
  }

  // NOTE: Unless we have the delay, the input is not drawn
  //       in time for the focusmethod.
  showDescriptionInput() {
    this.descriptionInputShown = true;
    setTimeout(() => {
      this.projectDescriptionInput.nativeElement.value = this.activeProject.description;
      this.projectDescriptionInput.nativeElement.focus()
      this.projectDescriptionInput.nativeElement.select()
    }, 1);
  }

  onEnterName(value: string) {
    value = value.trim();
    if (value && value != this.activeProject.name) {
      this.changeProjectName(value);
    }

    this.hideNameInput();
  }

  onEnterDescription(value: string) {
    value = value.trim();
    if (value && value != this.activeProject.description) {
      this.changeProjectDescription(value);
    }

    this.hideDescriptionInput();
  }

}
