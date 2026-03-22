const isMac = /mac/i.test(navigator.platform) || /macintosh/i.test(navigator.userAgent);
const separator = isMac ? ' ' : ' + ';

export const formatKeys = (keys: string[]): string => {
  let str = '';
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    if (key.length === 1) key = key.toUpperCase();
    else {
      switch (key) {
        case 'Primary':
          key = isMac ? '⌘' : 'Ctrl';
          break;
        case 'Shift':
          key = isMac ? '⇧' : key;
          break;
        case 'Command':
          key = isMac ? '⌘' : key;
          break;
      }
    }
    str += (str ? separator : '') + key;
  }
  return str;
};
