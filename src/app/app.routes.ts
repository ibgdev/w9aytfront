import { Routes } from '@angular/router';
import { SignUpComponent } from './features/authentication/sign-up/sign-up.component';
import { Home } from './home/home';
import { Login } from './features/authentication/login/login';
import { CompanySignup } from './features/authentication/company-signup/company-signup';
import { ForgotPassword } from './features/authentication/forgot-password/forgot-password';
import { ResetPassword } from './features/authentication/reset-password/reset-password';
import { Notfound } from './notfound/notfound';
import { Profile } from './features/client/profile/profile';
import { SidebarComponent } from './features/admin/sidebar/sidebar.component/sidebar.component';
import { GestionUtilisateurs } from './features/admin/gestion-utilisateurs.component/gestion-utilisateurs.component';
import { GestionCompany } from './features/admin/gestion-company.component/gestion-company.component';
import { ValidationDemandesComponent } from './features/admin/validation-demandes.component/validation-demandes.component';
import { ContactMessagesComponent } from './features/admin/contact-messages.component/contact-messages.component';
import { DashboardComponent } from './features/admin/dashboard.component/dashboard.component';
import { NewDeliveryComponent } from './features/client/delivery/new-delivery/new-delivery';

import { Companies } from './features/client/companies/companies';
import { DetailCompany } from './features/client/companies/detail-company/detail-company';
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
    component: CompanySignup,
  },
  {
    path: 'forgot-password',
    component: ForgotPassword,
  },
  {
    path: 'reset-password',
    component: ResetPassword,
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/authentication/verify-email/verify-email').then(
        (m) => m.VerifyEmailComponent
      ),
  },
  {
    path: 'companies',
    component: Companies,
  },
  {
    path: 'companies/:id',
    component: DetailCompany,
  },
  {
    path: 'profile',
    component: Profile,
  },
  {
    path: 'admin',
    component: DashboardComponent,
  },
  {
    path: 'admin/gestion-utilisateurs',
    component: GestionUtilisateurs,
  },
  {
    path: 'admin/company',
    component: GestionCompany,
  },
  {
    path: 'admin/validation',
    component: ValidationDemandesComponent,
  },
  {
    path: 'admin/contact-messages',
    component: ContactMessagesComponent,
  },


   {
    path: 'new-delivery',
    component: NewDeliveryComponent
  },
  { 
    path: '**', component: Notfound
  },
];
