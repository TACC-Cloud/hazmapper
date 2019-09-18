import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, Route} from "@angular/router";
import {AuthService} from "../../services/authentication.service";

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.styl']
})
export class CallbackComponent implements OnInit {

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) { }

  ngOnInit() {
    // TODO: For some reason wso2 is sending back a fragment like #access_token=qadad&expires_in=3600

    let frag = this.route.snapshot.fragment;
    let params = new URLSearchParams(frag);
    let token = params.get("access_token");
    let expires_in = +params.get("expires_in");
    this.auth.setToken(token, expires_in);
    this.auth.getUserInfo();
    this.router.navigate(['/']);
  }

}
