import { NavItem } from './nav-item';

export let menu: NavItem[] = [
  {
    displayName: 'Home',
    iconName: 'dashboard',
    route: 'dashboard'
  },
  {
    displayName: 'User',
    iconName: 'face',
    route: 'Users_',
    children: [
      {
        displayName: 'Courses',
        iconName: 'account_box',
        route: 'users/courses'
      },
      {
        displayName: 'Training',
        iconName: 'account_box',
        route: 'users/trainings'
      },
      {
        displayName: 'Registration',
        iconName: 'account_box',
        route: 'users/registration'
      }
    ]
  }
];
