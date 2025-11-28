// src/app/features/new-delivery/new-delivery.component.ts
import { Component, AfterViewInit, OnDestroy, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { LocationService } from '../../../../core/services/location.service';
import { AuthService } from '../../../../core/services/auth.service';
import Swal from 'sweetalert2';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { Navbar } from '../../../../navbar/navbar';
import { Footer } from '../../../../footer/footer';
import { AllCompaniesService, PublicCompany } from '../../../../core/services/all-companies.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-delivery',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar, Footer],
  templateUrl: './new-delivery.html',
  styleUrls: ['./new-delivery.scss'],
})
export class NewDeliveryComponent implements AfterViewInit, OnDestroy,OnInit {
  dropoffAddress = new FormControl('');
  // full form for the page
  form: FormGroup;
  private authService: AuthService = inject(AuthService);
  private map!: L.Map;
  private marker?: L.Marker;
  private locationService = inject(LocationService);
  private deliveryService = inject(DeliveryService);
  private subs = new Subscription();
  companies = signal<PublicCompany[]>([]);
  private allCompaniesService = inject(AllCompaniesService);
  private auth = inject(AuthService);
  private router = inject(Router);

  // address status for UI hints: 'idle' | 'searching' | 'valid' | 'not-found' | 'too-short' | 'error'
  addressStatus: string = 'idle';
  addressMessage: string | null = null;

  constructor() {
    // Récupérer l'utilisateur connecté
    const user = this.authService.getCurrentUser();
    // build the form
    this.dropoffAddress = new FormControl('', Validators.required);
    this.form = new FormGroup({
      fullName: new FormControl(user?.name || '', Validators.required),
      phone: new FormControl(user?.phone || '', Validators.required),
      email: new FormControl(user?.email || '', [Validators.required, Validators.email]),
      company: new FormControl('', Validators.required),
      pickupAddress: new FormControl('', Validators.required),
      dropoffAddress: this.dropoffAddress,
      receiverName: new FormControl('', Validators.required),
      receiverPhone: new FormControl('', [Validators.required, Validators.pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)]),
      packageWeight: new FormControl(null, [Validators.required, this.weightRangeValidator]),
      packageSize: new FormControl('M', Validators.required),
      paymentMethod: new FormControl('Cash on Delivery', Validators.required),
    });
    // Configuration explicite des icônes Leaflet pour Angular
    const defaultIcon = L.icon({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Assigne cette icône par défaut à tous les Markers
    (L.Marker as any).prototype.options.icon = defaultIcon;

    console.log('Default Leaflet icon assigned:', defaultIcon);
  }

  // Validator: weight must be > 0 and < 100
  weightRangeValidator(control: AbstractControl): ValidationErrors | null {
    const v = Number(control.value);
    if (control.value === null || control.value === undefined || control.value === '') {
      return null; // required validator handles empty
    }
    if (isNaN(v)) {
      return { invalidNumber: true };
    }
    if (v <= 0) {
      return { tooSmall: { requiredGreaterThan: 0, actual: v } };
    }
    if (v >= 100) {
      return { tooLarge: { requiredLessThan: 100, actual: v } };
    }
    return null;
  }
  ngOnInit(): void {
    this.getCompanies();

    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    // Check if user is admin
    const user = this.auth.getCurrentUser();
    if (user?.role !== 'client') {
      this.router.navigateByUrl('/home');
      return;

  }
  }

  ngAfterViewInit(): void {
    this.initMap();

    // Charger la liste des companies depuis le backend


    // Lightweight status updater: only show "too-short" while typing,
    // do not show "searching" until the user finishes (blur or Enter).
    this.subs.add(
      this.dropoffAddress.valueChanges.pipe(debounceTime(200), distinctUntilChanged()).subscribe((v: any) => {
        const s = v ? String(v).trim() : '';
        if (!s) {
          this.addressStatus = 'idle';
          this.addressMessage = null;
        } else if (s.length <= 3) {
          this.addressStatus = 'too-short';
          this.addressMessage = 'Veuillez saisir au moins 4 caractères pour lancer la recherche.';
        } else {
          // ready to search on blur/enter, but don't start searching automatically
          this.addressStatus = 'idle';
          this.addressMessage = null;
        }
      })
    );
  }

  getCompanies(){
    this.allCompaniesService.getAllCompanies().subscribe({
      next: (data) => {
        this.companies.set(data);
      },
      error: (err) => {
        console.error('Error loading companies', err);
      },
    });
  }
  // Called when the input loses focus
  onAddressBlur() {
    const addr = String(this.dropoffAddress.value || '').trim();
    if (addr.length > 3) {
      this.performAddressSearch(addr);
    }
  }

  // Called on Enter key press
  onAddressEnter(e: Event) {
    e.preventDefault();
    const addr = String(this.dropoffAddress.value || '').trim();
    if (addr.length > 3) {
      this.performAddressSearch(addr);
    }
  }

  private performAddressSearch(addr: string) {
    this.addressStatus = 'searching';
    this.addressMessage = 'Recherche de l\'adresse...';

    this.locationService.forwardGeocode(addr).subscribe({
      next: (res) => {
        const coords = res?.coordinates;
        let lat: number | undefined;
        let lon: number | undefined;

        if (coords && coords.lat && coords.lon) {
          lat = coords.lat;
          lon = coords.lon;
        } else if (res?.features && res.features.length > 0) {
          const first = res.features[0];
          const gcoords = first.geometry && first.geometry.coordinates;
          if (gcoords && gcoords.length >= 2) {
            lon = gcoords[0];
            lat = gcoords[1];
          }
        } else if (res?.raw && res.raw.geometry && res.raw.geometry.coordinates) {
          const g = res.raw.geometry.coordinates;
          lon = g[0];
          lat = g[1];
        }

        if (lat !== undefined && lon !== undefined) {
          this.placeMarker(lat, lon);
          this.addressStatus = 'valid';
          this.addressMessage = 'Adresse trouvée.';
        } else {
          this.addressStatus = 'not-found';
          this.addressMessage = 'Aucun résultat trouvé pour cette adresse.';
        }
      },
      error: (err) => {
        console.error('Forward geocode error', err);
        // don't set a harsh error while the user is typing; show friendly message
        this.addressStatus = 'error';
        this.addressMessage = 'Erreur lors de la recherche de l\'adresse. Veuillez réessayer.';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.off();
      this.map.remove();
    }
    // unsubscribe all address-related subscriptions
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

  private initMap() {
    const defaultLat = 34.0;
    const defaultLon = 9.0;
    const defaultZoom = 6;

    this.map = L.map('map', { center: [defaultLat, defaultLon], zoom: defaultZoom });

    // Use the OpenStreetMap France tile server which tends to show localized labels for French
    // and provides a French-friendly style. This gives a more 'French' map experience.
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap France contributors'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.placeMarker(lat, lng);
      this.reverseGeocodeAndFill(lat, lng);
    });
  }

  private placeMarker(lat: number, lon: number) {
    if (this.marker) {
      this.marker.setLatLng([lat, lon]);
    } else {
      this.marker = L.marker([lat, lon]).addTo(this.map);
    }
    this.map.setView([lat, lon], 14);
  }

  private reverseGeocodeAndFill(lat: number, lon: number) {
    this.locationService.reverseGeocode(lat, lon).subscribe({
      next: (res) => {
        const address = res?.address ?? res?.features?.[0]?.properties?.formatted ?? '';
        this.form.get('dropoffAddress')?.setValue(address);
      },
      error: (err) => {
        console.error('Erreur reverse geocode', err);
      }
    });
  }

  computePrice(): number {
    const base = 5; // base price
    const sizeRate = this.form.get('packageSize')?.value === 'S' ? 3 : this.form.get('packageSize')?.value === 'M' ? 5 : 7;
    const raw = Number(this.form.get('packageWeight')?.value);
    let weight = 0;
    if (!isNaN(raw) && raw > 0) {
      weight = Math.min(raw, 99.99); // clamp to <100
    }
    const weightRate = weight * 1.2;
    const price = base + sizeRate + weightRate;
    return Math.round(price * 100) / 100;
  }

  onSubmit() {
    // Vérification spécifique pour le champ company
    if (!this.form.value.company) {
      this.form.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Missing Company',
        text: 'Please select a company before submitting your delivery.'
      });
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.authService.getCurrentUser();
    const price = Number(this.computePrice()) || 0;
    const paymentAmount = Number(price) + 7; // payment_amount = price + 7 (valeur fixe)
    const payload = {
      ...this.form.value,
      price: price,
      payment_amount: paymentAmount,
      currency: 'TND',
      status: 'pending',
      client_id: user?.id,
      company_id: this.form.value.company,
      payment_method: this.form.value.paymentMethod,
      receiver_name: this.form.value.receiverName,
      receiver_phone: this.form.value.receiverPhone,
    };

    console.log('📦 [FRONTEND] Creating delivery with payload:', payload);
    console.log('📦 [FRONTEND] price:', price, 'payment_amount:', paymentAmount);

    this.deliveryService.createDelivery(payload).subscribe({
      next: (res) => {
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: 'Delivery created!',
            text: 'Your delivery has been saved successfully.',
            confirmButtonText: 'OK'
          });
          const user = this.authService.getCurrentUser();
          this.form.reset({
            fullName: user?.name || '',
            phone: user?.phone || '',
            email: user?.email || '',
            company: '',
            pickupAddress: '',
            dropoffAddress: '',
            receiverName: '',
            receiverPhone: '',
            packageWeight: null,
            packageSize: 'M',
            paymentMethod: 'Cash on Delivery',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error while saving. Please try again.'
          });
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Server Error',
          text: 'Server error: ' + (err?.error?.error || err.message)
        });
      }
    });
  }
}
