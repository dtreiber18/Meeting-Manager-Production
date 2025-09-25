import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Import Quill and configure it
import Quill from 'quill';

// Configure Quill with default settings
const QuillConfig = {
  modules: {
    toolbar: true
  },
  theme: 'snow'
};

// Make Quill available globally
interface WindowWithQuill extends Window {
  Quill?: typeof Quill;
}
(window as unknown as WindowWithQuill).Quill = Quill;

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
