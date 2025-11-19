import { Routes } from '@angular/router';
import { SignUpComponent } from './features/authentication/sign-up/sign-up.component';
import { Home } from './home/home';
import { Login } from './features/authentication/login/login';
import { CompanySignup } from './features/authentication/company-signup/company-signup';
import { ForgotPassword } from './features/authentication/forgot-password/forgot-password';
import { ResetPassword } from './features/authentication/reset-password/reset-password';
import { Notfound } from './notfound/notfound';
import { Profile } from './features/client/profile/profile';
import { NewDeliveryComponent } from './features/client/delivery/new-delivery/new-delivery';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    component: Home,
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'signup',
    component: SignUpComponent,
  },
  {
    path: 'become-a-company',
    component: CompanySignup 
  },
  {
    path: 'forgot-password',
    component: ForgotPassword
  },
  {
    path: 'reset-password',
    component: ResetPassword
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./features/authentication/verify-email/verify-email').then(m => m.VerifyEmailComponent)
  },
  {
    path: 'profile',
    component: Profile
  },
   {
    path: 'new-delivery',
    component: NewDeliveryComponent
  },
  { 
    path: '**', component: Notfound
  },
];
