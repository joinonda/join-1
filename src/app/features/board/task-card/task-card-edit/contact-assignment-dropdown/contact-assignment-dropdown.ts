import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../../../../core/interfaces/db-contact-interface';

@Component({
  selector: 'app-contact-assignment-dropdown',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-assignment-dropdown.html',
  styleUrl: './contact-assignment-dropdown.scss',
  standalone: true,
})
export class ContactAssignmentDropdownComponent implements OnInit {
  @Input() contacts: Contact[] = [];
  @Input() selectedContactIds: string[] = [];
  @Output() selectedContactIdsChange = new EventEmitter<string[]>();

  showContactDropdown = false;
  filteredContacts: Contact[] = [];
  contactSearchTerm = 'Select contacts to assign';

  colorPalette = [
    '#FF7A00',
    '#9327FF',
    '#6E52FF',
    '#FC71FF',
    '#FFBB2B',
    '#1FD7C1',
    '#462F8A',
    '#FF4646',
    '#00BEE8',
    '#FF5EB3',
    '#FF745E',
    '#FFA35E',
    '#FFC701',
    '#0038FF',
    '#C3FF2B',
    '#FFE62B',
  ];

  ngOnInit() {
    this.filteredContacts = [...this.contacts];
  }

  toggleContactDropdown() {
    this.showContactDropdown = !this.showContactDropdown;
    if (!this.showContactDropdown) {
      this.contactSearchTerm = 'Select contacts to assign';
      this.filteredContacts = [...this.contacts];
    }
  }

  onContactInputFocus() {
    if (this.contactSearchTerm === 'Select contacts to assign') {
      this.contactSearchTerm = '';
    }
    this.showContactDropdown = true;
  }

  onContactInputBlur() {
    setTimeout(() => {
      if (this.contactSearchTerm.trim() === '') {
        this.contactSearchTerm = 'Select contacts to assign';
      }
    }, 200);
  }

  onContactSearch() {
    const searchTerm = this.contactSearchTerm.toLowerCase().trim();

    if (!searchTerm) {
      this.filteredContacts = [...this.contacts];
    } else {
      this.filteredContacts = this.contacts.filter((contact) =>
        contact.firstname.toLowerCase().includes(searchTerm)
      );
    }
  }

  toggleContact(contactId: string, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    const index = this.selectedContactIds.indexOf(contactId);
    const updatedIds = [...this.selectedContactIds];

    this.updateContactSelection(index, updatedIds, contactId);

    this.selectedContactIds = updatedIds;
    this.selectedContactIdsChange.emit(updatedIds);
  }

  private updateContactSelection(index: number, updatedIds: string[], contactId: string): void {
    if (index > -1) {
      updatedIds.splice(index, 1);
    } else {
      updatedIds.push(contactId);
    }
  }

  isContactSelected(contactId: string): boolean {
    return this.selectedContactIds.includes(contactId);
  }

  getSelectedContacts(): Contact[] {
    return this.contacts.filter((c) => this.selectedContactIds.includes(c.id!));
  }

  getInitials(contact: Contact): string {
    if (!contact || !contact.firstname) return '';
    const nameParts = contact.firstname.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return this.getFirstAndLastInitial(nameParts);
  }

  private getFirstAndLastInitial(nameParts: string[]): string {
    const firstInitial = nameParts[0].charAt(0);
    const lastInitial = nameParts[nameParts.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  }

  getAvatarColor(contact: Contact): string {
    let hash = 0;
    const idString = String(contact.id);
    for (let i = 0; i < idString.length; i++) {
      hash = idString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.colorPalette.length;
    return this.colorPalette[index];
  }

  closeDropdown() {
    this.showContactDropdown = false;
    this.contactSearchTerm = 'Select contacts to assign';
    this.filteredContacts = [...this.contacts];
  }

  onArrowHover(imgElement: HTMLImageElement, isDropdownOpen: boolean) {
    if (isDropdownOpen) {
      imgElement.src = 'assets/arrow-up-variant2.png';
    } else {
      imgElement.src = 'assets/arrow-down-variant2.png';
    }
  }

  onArrowLeave(imgElement: HTMLImageElement, isDropdownOpen: boolean) {
    if (isDropdownOpen) {
      imgElement.src = 'assets/board/arrow-drop-up-transparent.png';
    } else {
      imgElement.src = 'assets/board/arrow-drop-down-transparent.png';
    }
  }
}
