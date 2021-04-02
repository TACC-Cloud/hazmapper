import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {APP_BASE_HREF} from '@angular/common';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import {ModalModule, BsDropdownModule, TooltipModule, TabsModule, PaginationModule} from 'ngx-foundation';
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
import { LayersPanelComponent } from './components/layers-panel/layers-panel.component';
import { SettingsPanelComponent } from './components/settings-panel/settings-panel.component';
import { FiltersPanelComponent } from './components/filters-panel/filters-panel.component';
import { MeasurePanelComponent } from './components/measure-panel/measure-panel.component';
import { AssetDetailComponent } from './components/asset-detail/asset-detail.component';
import { FeatureIconComponent } from './components/feature-icon/feature-icon.component';
import { FeatureRowComponent } from './components/feature-row/feature-row.component';
import { FeatureMetadataComponent } from './components/feature-metadata/feature-metadata.component';
import { AuthService } from './services/authentication.service';
import { ModalService } from './services/modal.service';
import { EnvService } from './services/env.service';
import { CallbackComponent } from './components/callback/callback.component';
import {AuthInterceptor, JwtInterceptor} from './app.interceptors';
import { ModalCreateProjectComponent } from './components/modal-create-project/modal-create-project.component';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import { ModalFileBrowserComponent } from './components/modal-file-browser/modal-file-browser.component';
import { ModalCreatePointCloudComponent } from './components/modal-create-point-cloud/modal-create-point-cloud.component';
import { FeatureGeometryComponent } from './components/feature-geometry/feature-geometry.component';
import { PointCloudsPanelComponent } from './components/point-clouds-panel/point-clouds-panel.component';
import { PointCloudPanelRowComponent } from './components/point-cloud-panel-row/point-cloud-panel-row.component';
import { ModalCreateOverlayComponent } from './components/modal-create-overlay/modal-create-overlay.component';
import { ModalCreateTileServerComponent } from './components/modal-create-tile-server/modal-create-tile-server.component';
import { FileTreeNodeComponent } from './components/file-tree-node/file-tree-node.component';
import { ModalPointCloudInfoComponent } from './components/modal-point-cloud-info/modal-point-cloud-info.component';
import { FileBrowserComponent } from './components/file-browser/file-browser.component';
import { UsersPanelComponent } from './components/users-panel/users-panel.component';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { ModalConfirmationBodyComponent } from './components/modal-confirmation-body/modal-confirmation-body.component';
import { UserRowComponent } from './components/user-row/user-row.component';
import { EditNameInputComponent } from './components/edit-name-input/edit-name-input.component';
import { StreetviewPanelComponent } from './components/streetview-panel/streetview-panel.component';
import { ModalStreetviewPublishComponent } from './components/modal-streetview-publish/modal-streetview-publish.component';
import { MainWelcomeComponent } from './components/main-welcome/main-welcome.component';
import { MainProjectComponent } from './components/main-project/main-project.component';
import {DragDropModule, CDK_DRAG_CONFIG} from '@angular/cdk/drag-drop';
import { StreetviewSequenceComponent } from './components/streetview-sequence/streetview-sequence.component';
import { ModalStreetviewLogComponent } from './components/modal-streetview-log/modal-streetview-log.component';
import { StreetviewCallbackComponent } from './components/streetview-callback/streetview-callback.component';
import { StreetviewAccountsComponent } from './components/streetview-accounts/streetview-accounts.component';
import { StreetviewLogsComponent } from './components/streetview-logs/streetview-logs.component';
import { StreetviewAssetsComponent } from './components/streetview-assets/streetview-assets.component';
import { ModalStreetviewLinkComponent } from './components/modal-streetview-link/modal-streetview-link.component';

@NgModule({
  declarations: [
    AppComponent, MapComponent, NotFoundComponent, MainComponent, DockComponent,
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
    ModalCreatePointCloudComponent,
    FeatureGeometryComponent,
    PointCloudsPanelComponent,
    PointCloudPanelRowComponent,
    ModalCreateOverlayComponent,
    ModalCreateTileServerComponent,
    FileTreeNodeComponent,
    ModalPointCloudInfoComponent,
    FileBrowserComponent,
    UsersPanelComponent,
    ModalConfirmationBodyComponent,
    UserRowComponent,
    EditNameInputComponent,
    StreetviewPanelComponent,
    ModalStreetviewPublishComponent,
    MainWelcomeComponent,
    MainProjectComponent,
    StreetviewSequenceComponent,
    ModalStreetviewLogComponent,
    StreetviewCallbackComponent,
    StreetviewAccountsComponent,
    StreetviewLogsComponent,
    StreetviewAssetsComponent,
    ModalStreetviewLinkComponent,
  ],
  imports: [
    CommonModule,
    // this is for the ng-tapis library
    ApiModule.forRoot({rootUrl: 'https://agave.designsafe-ci.org/'}),
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    InfiniteScrollModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    FileSizeModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    ToastrModule.forRoot(),
    DragDropModule,
    PaginationModule.forRoot()
  ],
  providers: [
    AuthService,
    ModalService,
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
      provide: CDK_DRAG_CONFIG,
      useValue: {
        dragStartThreshold: 30,
        pointerDirectionChangeThreshold: 5,
        zIndex: 10000
      }
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (envService: EnvService) => () => envService.init(),
      deps: [EnvService],
      multi: true
    },
    {
      provide: APP_BASE_HREF,
      useFactory: (envService: EnvService) => {
        envService.init();
        return envService.baseHref;
      },
      deps: [EnvService],
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ModalConfirmationBodyComponent,
    ModalCreateProjectComponent,
    ModalFileBrowserComponent,
    ModalCreatePointCloudComponent,
    ModalCreateOverlayComponent,
    ModalStreetviewPublishComponent,
    ModalCreateTileServerComponent,
    ModalStreetviewLogComponent,
    ModalStreetviewLinkComponent,
    ModalPointCloudInfoComponent]
})
export class AppModule { }
