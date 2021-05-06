import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  constructor(
      private authService: AuthService,
      public router: Router,
  ) {}

  userIsLoggedIn(): boolean {
    return this.authService.getUserEmail() != undefined;
  }
}
