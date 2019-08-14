import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { ModalModule } from "ngx-foundation";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from "./app.component";
import { MapComponent} from "./components/map/map.component";
import { DockComponent } from "./components/dock/dock.component";
import { MainComponent } from "./components/main/main.component";
import { AssetsPanelComponent } from "./components/assets-panel/assets-panel.component";
import { NotFoundComponent } from './components/notfound/notfound.component';
import { ControlBarComponent } from './components/control-bar/control-bar.component';
import { DirectivesModule } from "./directives/directives.module";
import { LayersPanelComponent } from './components/layers-panel/layers-panel.component';
import { SettingsPanelComponent } from './components/settings-panel/settings-panel.component';
import { FiltersPanelComponent } from './components/filters-panel/filters-panel.component';
import { MeasurePanelComponent } from './components/measure-panel/measure-panel.component';
import { AssetDetailComponent } from './components/asset-detail/asset-detail.component';
import { FeatureIconComponent } from './components/feature-icon/feature-icon.component';
import { FeatureRowComponent } from './components/feature-row/feature-row.component';
import { FeatureMetadataComponent } from './components/feature-metadata/feature-metadata.component';
import { SidenavComponent } from "./components/sidenav/sidenav.component";
import { AuthService } from "./services/authentication.service";
import { CallbackComponent } from './components/callback/callback.component';
import { JwtInterceptor } from "./app.interceptors";


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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    DirectivesModule,
    InfiniteScrollModule,
    ModalModule
  ],
  providers: [
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: []
})
export class AppModule { }

