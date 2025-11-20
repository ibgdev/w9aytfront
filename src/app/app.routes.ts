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
import {DashboardComponent} from './features/admin/dashboard.component/dashboard.component';
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
    path: 'profile',
    component: Profile
  },
  /*
    {
    path: 'admin',
    component: SidebarComponent,
     
  },*/
    {
    path: 'admin/gestion-utilisateurs',
  component: GestionUtilisateurs
 
  },
   {
  path: 'admin/company',
  component: GestionCompany
},
  {
  path: 'admin/validation',
  component: ValidationDemandesComponent
},
  {
  path: 'admin/dashboard',
  component: DashboardComponent
},

  
  { 
    path: '**', component: Notfound
  },
 
];
