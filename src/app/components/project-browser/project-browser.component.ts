import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {SystemSummary} from 'ng-tapis';
import {AgaveSystemsService} from '../../services/agave-systems.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-project-browser',
  templateUrl: './project-browser.component.html',
  styleUrls: ['./project-browser.component.styl']
})
export class ProjectBrowserComponent implements OnInit {

  static limit = 200;
  public projects: Array<SystemSummary>;
  public hasError: boolean;
  private currentIndex = 0;
  public inProgress = true;
  private offset = 0;

  @Output() selection: EventEmitter<any> = new EventEmitter<any>();

  constructor(private agaveSystemsService: AgaveSystemsService) { }

  ngOnInit() {
    this.agaveSystemsService.list();
    this.agaveSystemsService.projects.pipe(take(1)).subscribe(projects => {
      this.selection.next(projects[0]);
      this.projects = projects;
    })
  }


  select(system: any, index: number) {
    console.log(system);
    this.selection.next(system);
    this.currentIndex = index;
  }

}
