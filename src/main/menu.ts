import { IsAutoReloadOn, toggleAutoReload } from '@settings/autoReload';
import {
  isScrSaverOn,
  toggleScrSaverOnOff,
  getScrSaverTimeout,
  setScrSaverTimeout,
} from '@settings/screenSaver';
import {
  DeveloperURL,
  ForumURL,
  IntroductionURL,
  ToolsURL,
} from '@share/constant/urls';
import { app, Menu, shell } from 'electron';
import { emtWindow, emtDev, emtSetting, emtApp } from './module/eventEmitters';
import windowController from '@controller/WindowController';
import {
  isAutoInspectorOn,
  toggleAutoInspector,
} from '@settings/autoInspector';
import { getTouchMode, toggleTouchMode } from '@settings/touchMode';
import { getScrOrn, setScrOrn } from '@settings/screenOrientation';
import windowSetting from '@settings/windowSetting';
import type { MenuItemConstructorOptions } from 'electron';
import { branch, productName } from 'package.json';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

class MenuBuilder {
  buildMenu(): Menu {
    const template = this.menuTemplate();
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setEventListener() {
    ['touch-mode-changed', 'screen-orientation-changed'].forEach(
      (eventName) => {
        emtSetting.on(eventName, () => this.buildMenu());
      }
    );

    [
      'app-list-window-show',
      'app-list-window-hide',
      'js-service-window-show',
      'js-service-window-hide',
    ].forEach((eventName) => {
      emtWindow.on(eventName, () => this.buildMenu());
    });
  }

  menuTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: 'webOS TV',
      submenu: [
        {
          label: `About ${productName}`,
          selector: 'orderFrontStandardAboutPanel:',
        },
        {
          label: 'Quit',
          accelerator: 'CommandOrControl+Q',
          click: () => {
            app.exit();
          },
        },
      ],
    };
    const subMenuFile: MenuItemConstructorOptions = {
      label: 'File',
      submenu: [
        {
          label: 'Launch App',
          accelerator: 'CommandOrControl+A',
          click: () => {
            emtWindow.emit('open-app-dialog');
          },
        },
        {
          label: 'Add Service',
          accelerator: 'CommandOrControl+S',
          click: () => {
            emtWindow.emit('open-service-dialog');
          },
        },
        {
          label: 'Close App',
          accelerator: 'CommandOrControl+T',
          click: () => {
            emtApp.emit('close-fg-app');
          },
        },
      ],
    };
    const subMenuOptions: MenuItemConstructorOptions = {
      label: 'Tools',
      submenu: [
        {
          label: 'App List',
          accelerator: 'CommandOrControl+Alt+A',
          type: 'checkbox',
          checked: windowController.isVisibleAppList(),
          click: () => {
            if (windowController.isVisibleAppList())
              windowController.hideAppList();
            else windowController.showAppList();
          },
        },
        {
          label: 'Service List',
          accelerator: 'CommandOrControl+Alt+S',
          type: 'checkbox',
          checked: windowController.isVisibleJSServiceList(),
          click: () => {
            if (windowController.isVisibleJSServiceList())
              windowController.hideJSServiceList();
            else windowController.showJSServiceList();
          },
        },
        {
          label: 'Inspector',
          accelerator: 'CommandOrControl+Alt+I',
          click: () => {
            emtApp.emit('toggle-inspector');
          },
        },
        {
          label: 'Inspector',
          accelerator: 'F12',
          visible: false,
          click: () => {
            emtApp.emit('toggle-inspector');
          },
        },
      ],
    };

    const subMenuAction: MenuItemConstructorOptions = {
      label: 'Action',
      submenu: [
        {
          label: 'Auto Inspector',
          type: 'checkbox',
          checked: isAutoInspectorOn(),
          click: () => {
            toggleAutoInspector();
            this.buildMenu();
          },
        },
        {
          label: 'Auto Reload',
          type: 'checkbox',
          checked: IsAutoReloadOn(),
          click: () => {
            toggleAutoReload();
            this.buildMenu();
          },
        },
        {
          label: 'Touch Mode',
          type: 'checkbox',
          checked: getTouchMode(),
          click: () => {
            toggleTouchMode();
            this.buildMenu();
          },
        },
        {
          label: 'Orientation',
          submenu: [
            {
              label: 'landscape',
              type: 'checkbox',
              checked: getScrOrn() === 'landscape',
              enabled: getScrOrn() !== 'landscape',
              click: () => {
                setScrOrn('landscape');
                this.buildMenu();
              },
            },
            {
              label: 'portrait',
              type: 'checkbox',
              checked: getScrOrn() === 'portrait',
              enabled: getScrOrn() !== 'portrait',
              click: () => {
                setScrOrn('portrait');
                this.buildMenu();
              },
            },
            {
              label: 'reversed_landscape',
              type: 'checkbox',
              checked: getScrOrn() === 'reversed_landscape',
              enabled: getScrOrn() !== 'reversed_landscape',
              click: () => {
                setScrOrn('reversed_landscape');
                this.buildMenu();
              },
            },
            {
              label: 'reversed_portrait',
              type: 'checkbox',
              checked: getScrOrn() === 'reversed_portrait',
              enabled: getScrOrn() !== 'reversed_portrait',
              click: () => {
                setScrOrn('reversed_portrait');
                this.buildMenu();
              },
            },
          ],
        },
        {
          label: 'Size',
          submenu: [
            {
              label: '640x360',
              type: 'checkbox',
              checked: windowSetting.zoom === 0.5,
              enabled: windowSetting.zoom !== 0.5,
              click: () => {
                windowSetting.setZoom(0.5);
                this.buildMenu();
              },
            },
            {
              label: '960x540',
              type: 'checkbox',
              checked: windowSetting.zoom === 0.75,
              enabled: windowSetting.zoom !== 0.75,
              click: () => {
                windowSetting.setZoom(0.75);
                this.buildMenu();
              },
            },
            {
              label: '1280x720',
              type: 'checkbox',
              checked: windowSetting.zoom === 1,
              enabled: windowSetting.zoom !== 1,
              click: () => {
                windowSetting.setZoom(1);
                this.buildMenu();
              },
            },
            {
              label: '1920x1080',
              type: 'checkbox',
              checked: windowSetting.zoom === 1.5,
              enabled: windowSetting.zoom !== 1.5,
              click: () => {
                windowSetting.setZoom(1.5);
                this.buildMenu();
              },
            },
          ],
        },
        {
          label: 'Screen Saver',
          submenu: [
            {
              label: 'Turn On',
              type: 'checkbox',
              checked: isScrSaverOn(),
              click: () => {
                toggleScrSaverOnOff();
                this.buildMenu();
              },
            },
            {
              label: 'Timeout delay',
              submenu: [
                {
                  label: ' 5s',
                  type: 'checkbox',
                  checked: getScrSaverTimeout() === 5,
                  click: () => {
                    setScrSaverTimeout(5);
                    this.buildMenu();
                  },
                },
                {
                  label: '10s',
                  type: 'checkbox',
                  checked: getScrSaverTimeout() === 10,
                  click: () => {
                    setScrSaverTimeout(10);
                    this.buildMenu();
                  },
                },
                {
                  label: '30s',
                  type: 'checkbox',
                  checked: getScrSaverTimeout() === 30,
                  click: () => {
                    setScrSaverTimeout(30);
                    this.buildMenu();
                  },
                },
                {
                  label: ' 2m',
                  type: 'checkbox',
                  checked: getScrSaverTimeout() === 120,
                  click: () => {
                    setScrSaverTimeout(120);
                    this.buildMenu();
                  },
                },
                {
                  label: ' 1h',
                  type: 'checkbox',
                  checked: getScrSaverTimeout() === 3600,
                  click: () => {
                    setScrSaverTimeout(3600);
                    this.buildMenu();
                  },
                },
              ],
            },
          ],
        },
        { type: 'separator' },
        {
          label: 'Database Reset',
          click: () => {
            emtSetting.emit('reset-database');
          },
        },
      ],
    };
    const subMenuHelp: MenuItemConstructorOptions = {
      label: 'Help',
      submenu: [
        {
          label: 'webOS TV Developer',
          click() {
            shell.openExternal(DeveloperURL);
          },
        },
        {
          label: 'News',
          click() {
            shell.openExternal(`${DeveloperURL}/news`);
          },
        },
        {
          label: 'Forum',
          click() {
            shell.openExternal(ForumURL);
          },
        },
        {
          label: 'About webOS TV Simulator',
          click() {
            shell.openExternal(IntroductionURL);
          },
        },
        {
          label: 'See webOS TV SDK Tools',
          click() {
            shell.openExternal(ToolsURL);
          },
        },
      ],
    };

    const subDevelMenu: MenuItemConstructorOptions = {
      label: 'Devel',
      submenu: [
        {
          label: 'Open devtools',
          submenu: [
            {
              label: 'foreground App',
              click: () => emtDev.emit('open-devtools-fgApp'),
            },
            {
              label: 'main',
              click: () => emtDev.emit('open-devtools-main'),
            },
            {
              label: 'rcu',
              click: () => emtDev.emit('open-devtools-rcu'),
            },
            {
              label: 'App List',
              click: () => emtDev.emit('open-devtools-appList'),
            },
            {
              label: 'JS Service',
              click: () => emtDev.emit('open-devtools-jsService'),
            },
            {
              label: 'Screen Saver',
              click: () => emtDev.emit('open-devtools-screenSaver'),
            },
            {
              label: 'App Exit',
              click: () => emtDev.emit('open-devtools-appExit'),
            },
            {
              label: 'Touch',
              click: () => emtDev.emit('open-devtools-touch'),
            },
            {
              label: 'Touch Remote',
              click: () => emtDev.emit('open-devtools-touchRemote'),
            },
            {
              label: 'VKB Default',
              click: () => emtDev.emit('open-devtools-vkb-default'),
            },
            {
              label: 'VKB Number',
              click: () => emtDev.emit('open-devtools-vkb-number'),
            },
          ],
        },
        {
          label: 'Emit dev event',
          submenu: [
            {
              label: 'dev-test1',
              click: () => emtDev.emit('dev-test1'),
              accelerator: 'CommandOrControl+1',
            },
            {
              label: 'dev-test2',
              click: () => emtDev.emit('dev-test2'),
              accelerator: 'CommandOrControl+2',
            },
            {
              label: 'dev-test3',
              click: () => emtDev.emit('dev-test3'),
              accelerator: 'CommandOrControl+3',
            },
            {
              label: 'dev-test4',
              click: () => emtDev.emit('dev-test4'),
              accelerator: 'CommandOrControl+4',
            },
            {
              label: 'dev-test5',
              click: () => emtDev.emit('dev-test5'),
              accelerator: 'CommandOrControl+5',
            },
            {
              label: 'dev-test6',
              click: () => emtDev.emit('dev-test6'),
              accelerator: 'CommandOrControl+6',
            },
            {
              label: 'dev-test7',
              click: () => emtDev.emit('dev-test7'),
              accelerator: 'CommandOrControl+7',
            },
            {
              label: 'dev-preload-test1',
              click: () => emtDev.emit('dev-preload-test1'),
            },
            {
              label: 'dev-preload-test2',
              click: () => emtDev.emit('dev-preload-test2'),
            },
            {
              label: 'dev-preload-test3',
              click: () => emtDev.emit('dev-preload-test3'),
            },
          ],
        },
      ],
    };
    const devMenu = branch === 'develop' ? [subDevelMenu] : [];
    const menu =
      process.platform === 'darwin'
        ? [
            subMenuAbout,
            subMenuFile,
            subMenuOptions,
            subMenuAction,
            subMenuHelp,
          ]
        : [subMenuFile, subMenuOptions, subMenuAction, subMenuHelp];

    return [...menu, ...devMenu];
  }
}

const menuBuilder = new MenuBuilder();
export default menuBuilder;
