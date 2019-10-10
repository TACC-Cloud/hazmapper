import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {APP_BASE_HREF} from '@angular/common';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import {ModalModule, BsDropdownModule} from 'ngx-foundation';
import { FileSizeModule } from 'ngx-filesize';
import { ApiModule} from 'ng-tapis';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent} from './components/map/map.component';
import { DockComponent } from './components/dock/dock.component';
import { MainComponent } from './components/main/main.component';
import { AssetsPanelComponent } from './components/assets-panel/assets-panel.component';
import { NotFoundComponent } from './components/notfound/notfound.component';
import { ControlBarComponent } from './components/control-bar/control-bar.component';
import { DirectivesModule } from './directives/directives.module';
import { LayersPanelComponent } from './components/layers-panel/layers-panel.component';
import { SettingsPanelComponent } from './components/settings-panel/settings-panel.component';
import { FiltersPanelComponent } from './components/filters-panel/filters-panel.component';
import { MeasurePanelComponent } from './components/measure-panel/measure-panel.component';
import { AssetDetailComponent } from './components/asset-detail/asset-detail.component';
import { FeatureIconComponent } from './components/feature-icon/feature-icon.component';
import { FeatureRowComponent } from './components/feature-row/feature-row.component';
import { FeatureMetadataComponent } from './components/feature-metadata/feature-metadata.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { AuthService } from './services/authentication.service';
import { CallbackComponent } from './components/callback/callback.component';
import {AuthInterceptor, JwtInterceptor} from './app.interceptors';
import { ModalCreateProjectComponent } from './components/modal-create-project/modal-create-project.component';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import { ModalFileBrowserComponent } from './components/modal-file-browser/modal-file-browser.component';
import {environment} from '../environments/environment';


@NgModule({
  declarations: [
    AppComponent, MapComponent, NotFoundComponent, MainComponent, DockComponent,
    SidenavComponent,
    AssetsPanelComponent,
    ControlBarComponent,
    LayersPanelComponent,
    SettingsPanelComponent,
    FiltersPanelComponent,
    MeasurePanelComponent,
    AssetDetailComponent,
    FeatureIconComponent,
    FeatureRowComponent,
    FeatureMetadataComponent,
    CallbackComponent,
    ModalCreateProjectComponent,
    ModalFileBrowserComponent,
  ],
  imports: [
    // this is for the ng-tapis library
    ApiModule.forRoot({rootUrl: 'https://agave.designsafe-ci.org/'}),
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    DirectivesModule,
    InfiniteScrollModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    FileSizeModule,

  ],
  providers: [
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: AuthInterceptor
    },
    {
      provide: APP_BASE_HREF,
      useValue: environment.baseHref
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [ModalCreateProjectComponent, ModalFileBrowserComponent]
})
export class AppModule { }

