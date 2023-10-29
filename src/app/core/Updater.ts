import {
  ProgressInfo,
  UpdateDownloadedEvent,
  UpdateInfo,
  autoUpdater,
} from 'electron-updater';
import { WindowController } from './window/WindowController';
import { Database } from 'sqlite';
import { CoreConfig } from './CoreConfig';
import appUpgradeInfos from './upgrades';

class Updater {
  private windowController: WindowController;
  private database: Database;
  private config: CoreConfig;

  // TODO: Use separate files to define the upgrades
  private readonly appUpgradeInfoMap = appUpgradeInfos;

  public constructor(
    windowController: WindowController,
    database: Database,
    config: CoreConfig
  ) {
    this.windowController = windowController;
    this.database = database;
    this.config = config;
    this.setupHandlers();
  }

  public checkForUpdates() {
    autoUpdater.checkForUpdates();
  }

  private isUpgradeNeeded() {
    const currentVersion = this.config.get('version');
    for (const version in this.appUpgradeInfoMap) {
      if (version > currentVersion) {
        return true; // Upgrade is needed
      }
    }
    return false; // No upgrades are needed
  }

  private async handleAppUpgrade() {
    const currentVersion = this.config.get('version');
    // Get all upgrades todo
    const upgradeVersions = Object.keys(this.appUpgradeInfoMap).filter(
      (version) => version > currentVersion
    );
    // TODO: Rework to not create the upgrade objects here
    // Get the amount of actions todo
    const actionsLength = upgradeVersions
      .map(
        (value) =>
          new this.appUpgradeInfoMap[value](this.config, this.database).actions
            .length
      )
      .reduce((acc, curr) => acc + curr, 0);

    let executedActions = 0;

    // Execute actions per upgrade version one by one and update progress bar.
    for (const version of upgradeVersions) {
      const upgradeInfo = new this.appUpgradeInfoMap[version](
        this.config,
        this.database
      );

      this.windowController.currentWindow.sendIpc(
        'updateText',
        `Upgrading to version ${upgradeInfo.version} - ${upgradeInfo.description}`,
        false
      );

      for (const action of upgradeInfo.actions) {
        await action(); // Perform action and wait for it to finish
        executedActions++;
        // Send upgrade percentage
        this.windowController.currentWindow.sendIpc(
          'updatePercentage',
          (executedActions / actionsLength) * 100
        );
      }
    }

    // Upgrade finished
    this.windowController.currentWindow.sendIpc(
      'updateText',
      `Upgrade finished. Starting app please wait.`,
      false
    );
    // Wait 4 sec before starting the app.
    setTimeout(() => {
      this.windowController.openMainWindow(this.database, this.config);
    }, 4000);
  }

  public restartAndUpdate() {
    autoUpdater.quitAndInstall();
  }

  private setupHandlers() {
    autoUpdater.on('checking-for-update', () => {
      this.windowController.openUpdateWindow(this);
      console.log('Checking for updates...');
    });

    autoUpdater.on('update-not-available', () => {
      console.log('No update available.');
      console.log('Checking for upgrades...');
      if (this.isUpgradeNeeded()) {
        // TODO: Remove timeout and detect if window is visible
        setTimeout(() => {
          this.windowController.currentWindow.sendIpc(
            'updateTitle',
            `Upgrade in progress`
          );
          this.handleAppUpgrade();
        }, 1000);
      } else {
        console.log('Everything up-to-date.');
        this.windowController.openMainWindow(this.database, this.config);
      }
    });

    autoUpdater.on('update-available', (info: UpdateInfo) => {
      this.windowController.currentWindow.sendIpc(
        'updateTitle',
        `Update in progress`
      );
      this.windowController.currentWindow.sendIpc(
        'updateText',
        `Downloading new update. Version: ${info.version}`,
        false
      );
    });

    autoUpdater.on('download-progress', (info: ProgressInfo) => {
      this.windowController.currentWindow.sendIpc(
        'updatePercentage',
        info.percent
      );
    });

    autoUpdater.on('update-downloaded', (event: UpdateDownloadedEvent) => {
      this.windowController.currentWindow.sendIpc(
        'updateText',
        `A new version (${event?.version}) has been downloaded. Restart the application to apply the updates.`,
        true
      );
    });
  }
}

export { Updater };