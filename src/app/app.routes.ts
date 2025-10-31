import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./home/home').then(m => m.Home),
    },
    {
        path: 'events',
        loadComponent: () => import('./createEvent/createEvent').then(m => m.CreateEventComponent),
    }
];
