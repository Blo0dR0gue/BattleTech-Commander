import { WindowBase } from './WindowBase';
import { MainWindow } from './main/MainWindow';

import { UpdateWindow } from './update/UpdateWindow';
import { Updater } from '../Updater';
import { CoreConfig } from '../CoreConfig';
import sqlite3 = require('sqlite3');

class WindowController {
  public currentWindow: WindowBase;

  private isDevelopment: boolean;

  public constructor(isDevelopment: boolean) {
    this.isDevelopment = isDevelopment;
  }

  public openMainWindow(database: sqlite3.Database, config: CoreConfig) {
    this.setWindow(new MainWindow(this.isDevelopment, database, config));
  }

  public openUpdateWindow(updater: Updater) {
    this.setWindow(new UpdateWindow(this.isDevelopment, updater));
  }

  private setWindow(newWindow: WindowBase) {
    if (this.currentWindow) {
      this.currentWindow.close();
      this.currentWindow = newWindow;
    } else {
      this.currentWindow = newWindow;
    }
  }
}

export { WindowController };
