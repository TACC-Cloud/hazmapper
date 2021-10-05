import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {EnvironmentType} from '../../environments/environmentType';

@Injectable({ providedIn: 'root' })
export class EnvService {
  private _env: EnvironmentType;
  private _apiUrl: string;
  private _portalUrl: string;
  private _jwt?: string;
  // private _googleClientId?: string;
  // TODO Move to somewhere else...
  // private _googleClientSecret?: string;
  // private _mapillaryClientId?: string;
  // private _mapillaryClientIdAuth?: string;
  // private _mapillaryClientSecret?: string;
  // private _mapillaryApiUrl?: string;
  private _clientId: string;
  private _baseHref: string;
  private _streetviewEnv: any;

  private getApiUrl(backend: EnvironmentType): string {
    if (backend === EnvironmentType.Local) {
      return 'http://localhost:8888';
    } else if (backend === EnvironmentType.Staging) {
      return 'https://agave.designsafe-ci.org/geo-staging/v2';
    } else if (backend === EnvironmentType.Production) {
      return 'https://agave.designsafe-ci.org/geo/v2';
    } else {
      throw new Error('Unsupported Type');
    }
  }

  private getPortalUrl(backend: EnvironmentType): string {
    if (backend === EnvironmentType.Production) {
      return 'https://www.designsafe-ci.org/';
    } else {
      return 'https://designsafeci-dev.tacc.utexas.edu/';
    }
  }

  get isProduction(): boolean {
    return this._env === EnvironmentType.Production;
  }

  get env(): EnvironmentType {
    return this._env;
  }

  get apiUrl(): string {
    return this._apiUrl;
  }

  get jwt(): string {
    return this._jwt;
  }

  get clientId(): string {
    return this._clientId;
  }

  get streetviewEnv(): any {
    return this._streetviewEnv;
  }

  // get googleClientId(): string {
  //   return this._googleClientId;
  // }

  // get googleClientSecret(): string {
  //   return this._googleClientSecret;
  // }

  // get mapillaryClientId(): string {
  //   return this._mapillaryClientId;
  // }

  // get mapillaryClientIdAuth(): string {
  //   return this._mapillaryClientIdAuth;
  // }

  // get mapillaryClientSecret(): string {
  //   return this._mapillaryClientSecret;
  // }

  // get mapillaryApiUrl(): string {
  //   return this._mapillaryApiUrl;
  // }

  get baseHref(): string {
    return this._baseHref;
  }

  get designSafeUrl(): string {
    return 'https://agave.designsafe-ci.org/';
  }

  get portalUrl(): string {
    return this._portalUrl;
  }

  constructor() {}

  init(): Promise<void> {
    return new Promise(resolve => {
      this.setEnvVariables();
      resolve();
    });
  }

  private setEnvVariables(): void {
    const hostname = window && window.location && window.location.hostname;
    const pathname = window && window.location && window.location.pathname;

    this._streetviewEnv = {
      google: {
        clientSecret: '',
        clientId: '573001329633-1p0k8rko13s6n2p2cugp3timji3ip9f0.apps.googleusercontent.com',
        // tslint:disable-next-line:max-line-length
        scope: 'https://www.googleapis.com/auth/streetviewpublish+https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token'
      },
      mapillary: {
        clientSecret: 'MLY|4045602648858965|a8572bcecde684bc4c77c006e145019b',
        clientId: '4045602648858965',
        clientAuth: 'MLY|4045602648858965|5b906cb2dfd6d0f7c5ed7cb7d50620d8',
        tileUrl: 'https://tiles.mapillary.com/',
        apiUrl: 'https://graph.mapillary.com/',
        tokenUrl: 'https://graph.mapillary.com/token',
        authUrl: 'https://www.mapillary.com/connect',
        scope: 'user:email+user:read+user:write+public:write+public:upload+private:read+private:write+private:upload'
      }
    };

    // this._googleClientSecret = '';
    // this._googleClientId = '573001329633-1p0k8rko13s6n2p2cugp3timji3ip9f0.apps.googleusercontent.com';
    // // this._mapillaryClientId = 'VDRaeGFzMEtzRnJrMFZwdVYzckd6cjo0ZWY3ZDEzZGIyMWJkZjNi';
    // // this._mapillaryClientId = 'SHpCUGVyZ0R5eTdwZmhzajB1dzA4MDpkZWQxMjY4N2E1NDljMTFk';
    // // this._mapillaryClientId = '4045602648858965';
    // this._mapillaryClientId = 'MLY|4045602648858965|5b906cb2dfd6d0f7c5ed7cb7d50620d8';
    // this._mapillaryClientIdAuth = '4045602648858965';
    // this._mapillaryClientSecret = 'MLY|4045602648858965|a8572bcecde684bc4c77c006e145019b';
    // this._mapillaryApiUrl = 'https://a.mapillary.com/v3';

    if (/^localhost/.test(hostname)) {
      this._env = EnvironmentType.Local;
      this._apiUrl = this.getApiUrl(environment.backend);
      this._portalUrl = this.getPortalUrl(environment.backend);
      // when we are using the local backend, a jwt is required
      if (environment.backend === EnvironmentType.Local) {
        this._jwt = environment.jwt;
      }
      this._baseHref = '/';
      this._clientId = 'RMCJHgW9CwJ6mKjhLTDnUYBo9Hka';
    } else if (/^hazmapper.tacc.utexas.edu/.test(hostname) && pathname.startsWith('/staging')) {
      this._env = EnvironmentType.Staging;
      this._apiUrl = this.getApiUrl(this.env);
      this._portalUrl = this.getPortalUrl(this.env);
      this._clientId = 'foitdqFcimPzKZuMhbQ1oyh3Anka';
      this._baseHref = '/staging/';
    } else if (/^hazmapper.tacc.utexas.edu/.test(hostname)) {
      this._env = EnvironmentType.Production;
      this._apiUrl = this.getApiUrl(this.env);
      this._portalUrl = this.getPortalUrl(this.env);
      this._clientId = 'tMvAiRdcsZ52S_89lCkO4x3d6VMa';
      this._baseHref = '/hazmapper/';
    } else {
      console.error('Cannot find environment for host name ${hostname}');
    }
  }
}
