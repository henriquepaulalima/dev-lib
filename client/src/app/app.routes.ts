import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(({ Home }) => Home),
    title: 'Dev Lib — Components and features'
  },
  {
    path: 'components',
    loadComponent: () => import('./pages/collection/collection').then(({ Collection }) => Collection),
    data: {
      entryType: 'component',
      heading: 'Components',
      description: 'Focused frontend pieces ready to adapt, combine, and reuse.'
    },
    title: 'Components — Dev Lib'
  },
  {
    path: 'features',
    loadComponent: () => import('./pages/collection/collection').then(({ Collection }) => Collection),
    data: {
      entryType: 'feature',
      heading: 'Features',
      description: 'Backend logic, architecture patterns, and implementation concepts.'
    },
    title: 'Features — Dev Lib'
  },
  {
    path: 'entry/:slug',
    loadComponent: () => import('./pages/details/details').then(({ Details }) => Details),
    title: 'Dev Lib — Entry details'
  },
  { path: '**', redirectTo: '' }
];
