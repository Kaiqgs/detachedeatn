import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { provideIndexedDb, DBConfig } from 'ngx-indexed-db';

const dbConfig: DBConfig  = {
  name: 'MyDb',
  version: 1,
  objectStoresMeta: [{
    store: 'meal',
    storeConfig: { keyPath: 'id', autoIncrement: true },
    storeSchema: [
      { name: 'name', keypath: 'name', options: { unique: false } },
      { name: 'email', keypath: 'email', options: { unique: false } }
    ]
  }]
};


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    provideIndexedDb(dbConfig)
  ]
})
export class AppModule { }
