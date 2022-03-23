import { installRouter } from 'pwa-helpers';
import voiceUniverses from '@virtual:tree:../../public/voices';
import { DirStructureElement } from '../../../../config/vite/plugins/tree';
import { playMatch } from './game';
import { notify } from './notify';
import emptyOgg from '../assets/empty.ogg';
import { hideMenu, showMenu } from './menu';

const baseHref = document.querySelector('base')!.getAttribute('href')!;

const startButton = document.querySelector<HTMLButtonElement>('#start')!;

const prepareGame = (universe: string, characters: DirStructureElement[]) => {
  hideMenu();
  startButton.hidden = false;
  startButton.addEventListener(
    'click',
    async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      await playMatch(stream, universe, characters);
    },
    {
      once: true,
    },
  );
};

const checkForOggSupport = async () => {
  const testOgg = new Audio(emptyOgg);

  try {
    await testOgg.play();
    return true;
  } catch {
    return false;
  }
};

installRouter(({ pathname }) => {
  switch (pathname) {
    case baseHref:
      showMenu('Main Menu', [
        {
          name: 'Single Player',
          url: 'single-player',
        },
        // TODO: coming soon
        // {
        //   name: 'Multiplayer',
        //   url: 'multiplayer',
        // },
        // {
        //   name: 'Online Play',
        //   url: 'online-play',
        // },
        // {
        //   name: 'About',
        //   url: 'about',
        // },
      ]);
      break;
    case `${baseHref}single-player`:
      showMenu(
        'Select the universe you want to play with',
        voiceUniverses.map(({ name, children }) => ({
          name,
          onClick: async () => {
            const supportsOgg = await checkForOggSupport();
            if (supportsOgg) {
              prepareGame(name, children);
            } else {
              notify('Your browser is not supported. :(', -1);
            }
          },
        })),
      );
      break;
  }
});
