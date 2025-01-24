import { getTargetFilePath } from '@share/lib/paths';
import path from 'path';
import appState from './appState';

function makeFontFace(dirName: string, fontFileName: string, fontName: string) {
  const assetPath = getTargetFilePath('assets', 'font', dirName, fontFileName)
    .replace(/\\/g, '/')
    .replace(/ /g, '\\ ');

  return new FontFace(fontName, `url(file://${assetPath})`);
}

function getLGFontFaces() {
  return [
    makeFontFace('LGDisplay', 'LG_Display-Regular.ttf', 'LG Display-Regular'),
    makeFontFace('LGSmartUI', 'LG_Smart_UI-Regular.ttf', 'LG Smart UI Regular'),
    makeFontFace('LGSmartUI', 'LG_Smart_UI-Bold.ttf', 'LG Smart UI Bold'),
    makeFontFace('LGSmartUI', 'LG_Smart_UI-Light.ttf', 'LG Smart UI Light'),
    makeFontFace(
      'LGSmartUI',
      'LG_Smart_UI-SemiBold.ttf',
      'LG Smart UI SemiBold'
    ),
    makeFontFace('Miso', 'Miso-Regular.ttf', 'Miso Regular'),
    makeFontFace('Miso', 'Miso-Light.ttf', 'Miso Light'),
    makeFontFace('Miso', 'Miso-Bold.ttf', 'Miso Bold'),
    makeFontFace('MuseoSans', 'MuseoSans-Black.ttf', 'Museo Sans Black'),
    makeFontFace('MuseoSans', 'MuseoSans-Bold.ttf', 'Museo Sans Bold'),
    makeFontFace('MuseoSans', 'MuseoSans-Light.ttf', 'Museo Sans Light'),
    makeFontFace('MuseoSans', 'MuseoSans-Medium.ttf', 'Museo Sans Medium'),
    makeFontFace('MuseoSans', 'MuseoSans-Thin.ttf', 'Museo Sans Thin'),
  ];
}

export function loadLGFont() {
  // FIXME : In iframe, error is occurred
  if (!appState.isMainFrame) return;
  const LGFontFaces = getLGFontFaces();
  window.addEventListener('load', () => {
    LGFontFaces.forEach(async (font) => {
      try {
        await font.load();
        (document.fonts as any).add(font);
      } catch {
        // pass
      }
    });
  });
}
