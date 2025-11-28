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
import { History } from './features/client/delivery/history/history';
import { ConversationsList } from './features/client/chat/conversations-list/conversations-list';
import { Chat } from './features/client/chat/chat/chat';
import { DeliveriesComponent } from './features/livreur/deliveries/deliveries';
import { Deliveryall } from './features/livreur/deliveryall/deliveryall';
import { ProfileLivreurComponent } from './features/livreur/profilelivreur/profilelivreur';
import { ChatLivreur } from './features/livreur/chat/chat';
import { CompanyDashboardComponent } from './features/company-dashboard/company-dashboard.component';
import { DriversListComponent } from './features/company-dashboard/drivers-list/drivers-list.component';
import { CommandesComponent } from './features/company-dashboard/commandes/commandes.component';
import { StatistiquesComponent } from './features/company-dashboard/statistiques/statistiques.component';
import { EditProfileComponent } from './features/company-dashboard/edit-profile/edit-profile.component';

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
  },    {
    path: 'history',
    component: History
  },
  {
    path: 'chat',
    component: Chat
  },
  {
    path: 'chat/:id',
    component: Chat
  },
  {
        path: 'livreur',
        children: [
            {
                path: '',
                redirectTo: 'deliveries',
                pathMatch: 'full'
            },
            {
                path: 'deliveries',
                component: DeliveriesComponent
            },
            {
                path: 'deliveryall',
                component: Deliveryall
            },
            {
                path: 'profilelivreur',
                component: ProfileLivreurComponent
            },
            {
                path: 'chat',
                component: ChatLivreur
            },
            {
                path: 'chat/:id',
                component: ChatLivreur
            }
        ]
    },
    {
      path: 'company',
      component: CompanyDashboardComponent,
      children: [
        {
          path: '',
          redirectTo: 'livreurs',
          pathMatch: 'full'
        },
        {
          path: 'livreurs',
          component: DriversListComponent
        },
        {
          path: 'commandes',
          component: CommandesComponent
        },
        {
          path: 'statistiques',
          component: StatistiquesComponent
        },
        {
          path: 'edit-profile',
          component: EditProfileComponent
        }
      ]
    },
  { 
    path: '**', component: Notfound
  },
];
