import { Routes } from '@angular/router';
import { CotizacionesComponent } from './pages/cotizaciones/cotizaciones.component';

export const routes: Routes = [
  {
    path: '',
    component: CotizacionesComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
