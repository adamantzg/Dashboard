/* eslint-disable */

import './scss/style.scss';
import '@coreui/icons/css/coreui-icons.css';
import 'flag-icon-css/css/flag-icon.css';
import 'font-awesome/css/font-awesome.css';
import 'simple-line-icons/css/simple-line-icons.css';
import 'zone.js';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
// import { platformBrowser } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app/app.module';

enableProdMode();

// Styles.
// Enables Hot Module Replacement.
declare var module: any;

if (module.hot) {
    module.hot.accept();
}

platformBrowserDynamic().bootstrapModule(AppModule);
