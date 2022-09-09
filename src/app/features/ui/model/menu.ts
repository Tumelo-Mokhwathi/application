import { NavItem } from './nav-item';

export let menu: NavItem[] = [
  {
    displayName: 'Home',
    iconName: 'account_balance',
    route: 'dashboard'
  },
  {
    displayName: 'Menu',
    iconName: 'dashboard',
    route: 'Users_',
    children: [
      {
        displayName: 'Courses',
        iconName: 'assignment',
        route: 'users/courses'
      },
      {
        displayName: 'Training',
        iconName: 'assignment',
        route: 'users/trainings'
      },
      {
        displayName: 'Registration',
        iconName: 'assignment',
        route: 'users/registration'
      }
    ]
  }
];
