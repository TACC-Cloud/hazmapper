import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/authentication.service';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.styl'],
})
export class CallbackComponent implements OnInit {
  constructor(private route: ActivatedRoute, private auth: AuthService) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParams.access_token;
    const expires_in = this.route.snapshot.queryParams.expires_in;
    this.auth.setToken(token, expires_in);
  }
}
