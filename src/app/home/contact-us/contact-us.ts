import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactService, ContactFormData } from '../../core/services/contact.service';

@Component({
  selector: 'app-contact-us',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.scss',
})
export class ContactUs {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);

  contactForm = this.fb.group({
    fullname: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    tell: ['', [Validators.required, Validators.minLength(10)]]
  });

  submitted = signal(false);
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  get f() {
    return this.contactForm.controls;
  }

  onSubmit() {
    this.submitted.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.contactForm.invalid) {
      return;
    }

    this.isLoading.set(true);

    const formData: ContactFormData = {
      fullname: this.contactForm.value.fullname!,
      email: this.contactForm.value.email!,
      tell: this.contactForm.value.tell!
    };

    this.contactService.sendContact(formData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set(response.message || 'Message sent successfully! We will get back to you soon.');
        this.contactForm.reset();
        this.submitted.set(false);
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          this.successMessage.set('');
        }, 5000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Failed to send message. Please try again.');
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          this.errorMessage.set('');
        }, 5000);
      }
    });
  }
}
