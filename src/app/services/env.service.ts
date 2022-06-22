import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { EnvironmentType } from '../../environments/environmentType';

@Injectable({ providedIn: 'root' })
export class EnvService {
  private _env: EnvironmentType;
  private _apiUrl: string;
  private _portalUrl: string;
  private _jwt?: string;
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
    return new Promise((resolve) => {
      this.setEnvVariables();
      resolve();
    });
  }

  private setEnvVariables(): void {
    const hostname = window && window.location && window.location.hostname;
    const pathname = window && window.location && window.location.pathname;

    this._streetviewEnv = {
      google: {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope:
          // tslint:disable-next-line:max-line-length
          'https://www.googleapis.com/auth/streetviewpublish+https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile',
      },
      mapillary: {
        authUrl: 'https://www.mapillary.com/connect',
        tokenUrl: 'https://graph.mapillary.com/token',
        apiUrl: 'https://graph.mapillary.com/',
        tileUrl: 'https://tiles.mapillary.com/',
        scope:
          'user:email+user:read+user:write+public:write+public:upload+private:read+private:write+private:upload',
      },
      secrets: {},
    };

    if (/^localhost/.test(hostname) || /^hazmapper.local/.test(hostname)) {
      this._env = EnvironmentType.Local;
      this._apiUrl = this.getApiUrl(environment.backend);
      this._portalUrl = this.getPortalUrl(environment.backend);
      // when we are using the local backend, a jwt is required
      if (environment.backend === EnvironmentType.Local) {
        this._jwt = environment.jwt;
      }
      this._baseHref = '/';
      this._streetviewEnv.secrets = {
        google: {
          clientSecret: '',
          clientId:
            '573001329633-1p0k8rko13s6n2p2cugp3timji3ip9f0.apps.googleusercontent.com',
        },
        mapillary: {
          clientSecret: 'MLY|4866220476802272|909ed0e2baefa5d5c195710f5c83f98b',
          clientId: '4866220476802272',
          clientToken: 'MLY|4866220476802272|cedfb10deac752ca3ddf83997cef60a4',
        },
      };
      // local devevelopers can use localhost or hazmapper.local but
      // hazmapper.local is preferred as TAPIS supports it as a frame ancestor
      // (i.e. it allows for point cloud iframe preview)
      this._clientId = /^localhost/.test(hostname)
        ? 'RMCJHgW9CwJ6mKjhLTDnUYBo9Hka'
        : 'Eb9NCCtWkZ83c01UbIAITFvhD9ka';
    } else if (
      /^hazmapper.tacc.utexas.edu/.test(hostname) &&
      pathname.startsWith('/staging')
    ) {
      this._env = EnvironmentType.Staging;
      this._apiUrl = this.getApiUrl(this.env);
      this._portalUrl = this.getPortalUrl(this.env);
      this._clientId = 'foitdqFcimPzKZuMhbQ1oyh3Anka';
      this._baseHref = '/staging/';
      this._streetviewEnv.secrets = {
        google: {
          clientSecret: '',
          clientId:
            '573001329633-1p0k8rko13s6n2p2cugp3timji3ip9f0.apps.googleusercontent.com',
        },
        mapillary: {
          clientSecret: 'MLY|4936281379826603|cafd014ccd8cfc983e47c69c16082c7b',
          clientId: '4936281379826603',
          clientToken: 'MLY|4936281379826603|f8c4732d3c9d96582b86158feb1c1a7a',
        },
      };
    } else if (/^hazmapper.tacc.utexas.edu/.test(hostname)) {
      this._env = EnvironmentType.Production;
      this._apiUrl = this.getApiUrl(this.env);
      this._portalUrl = this.getPortalUrl(this.env);
      this._clientId = 'tMvAiRdcsZ52S_89lCkO4x3d6VMa';
      this._baseHref = '/hazmapper/';
      this._streetviewEnv.secrets = {
        google: {
          clientSecret: '',
          clientId:
            '573001329633-1p0k8rko13s6n2p2cugp3timji3ip9f0.apps.googleusercontent.com',
        },
        mapillary: {
          clientSecret: 'MLY|5156692464392931|6be48c9f4074f4d486e0c42a012b349f',
          clientId: '5156692464392931',
          clientToken: 'MLY|5156692464392931|4f1118aa1b06f051a44217cb56bedf79',
        },
      };
    } else {
      console.error('Cannot find environment for host name ${hostname}');
    }
  }
}
