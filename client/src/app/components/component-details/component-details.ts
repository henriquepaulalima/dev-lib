import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EntryDetails } from '../../models/library-entry';
import { ComponentPreview } from '../component-preview/component-preview';

@Component({
  selector: 'app-component-details',
  imports: [ComponentPreview],
  templateUrl: './component-details.html',
  styleUrl: './component-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentDetails {
  readonly entry = input.required<EntryDetails>();
}
