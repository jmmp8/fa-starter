import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
  constructor(
      private authService: AuthService,
      private router: Router,
  ) {}

  userIsLoggedIn(): boolean {
    return this.authService.getUserEmail() != undefined;
  }

  getButtonColor(route: string): string {
    return this.router.url.startsWith(route) ? 'primary' : 'basic';
  }
}
