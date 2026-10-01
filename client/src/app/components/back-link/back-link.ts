import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-back-link',
  imports: [RouterLink],
  templateUrl: './back-link.html',
  styleUrl: './back-link.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackLink {
  readonly target = input.required<string>();
  readonly label = input.required<string>();
}
