import * as React from 'react';
import {getUrl as getUrlDefault} from 'iconista/lib/getUrl';
import {useTheme} from 'nano-theme';
import useMountedState from 'react-use/lib/useMountedState';
import type {Icon} from 'iconista/lib/types';

const {useEffect, useState, useRef} = React;
const cache: {[key: string]: Document} = {};

export type Props = Icon &
  React.SVGAttributes<any> & {
    getUrl?: (icon: Icon) => string;
  };

const Svg: React.FC<Props> = ({set, icon, getUrl = getUrlDefault, ...rest}) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const mounted = useMountedState();
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    const applyDoc = (doc: Document) => {
      const el = ref.current;
      if (!el) return;
      el.innerHTML = '';
      const svg = (doc as any).getRootNode().childNodes[0] as SVGSVGElement;
      const {childNodes} = svg;
      // Set SVG child nodes.
      for (let i = 0; i < childNodes.length; i++) el.appendChild(childNodes[i].cloneNode(true));
      // Set SVG attributes.
      for (let i = 0; i < svg.attributes.length; i++) {
        const {name, value} = svg.attributes[i];
        el.setAttribute(name, value);
      }
    };
    const key = `${set}:${icon}`;
    if (cache[key]) applyDoc(cache[key]);
    else {
      const el = ref.current;
      if (el && rest.width && rest.height) {
        el.innerHTML = `<circle cx="${rest.width / 2}" cy="${rest.height / 2}" r="${Math.min(rest.width as number, rest.height as number) / 2}" fill="rgba(127,127,127,0.2)" />`;
      }
      const url = getUrl({set, icon} as Icon);
      fetch(url, {cache: 'force-cache'})
        .then(r => r.text())
        .then(text => {
          if (!mounted()) return;
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'application/xml');
          applyDoc((cache[key] = doc));
        })
        .catch((error) => {
          if (!mounted()) return;
          setError(error);
        });
    }
  }, [set, icon]);

  if (error) {
    const url = getUrl({set, icon} as Icon);
    return <img {...rest} src={url} title={error.message} />;
  }

  return <svg ref={ref} {...rest} />;
};


export type IconistaProps = Icon &
  React.SVGAttributes<any> & {
    colorStroke?: boolean;
    color?: string;
  };

export const Iconista: React.FC<IconistaProps> = ({colorStroke, color, ...rest}) => {
  const theme = useTheme();

  const iconColor = color || theme.g(0.4);

  return <Svg fill={iconColor} stroke={colorStroke ? iconColor : undefined} {...rest} />;
};

export const makeIcon = (
  icon: Partial<IconistaProps> & Icon,
): React.FC<Partial<Icon> & Omit<IconistaProps, keyof Icon>> => {
  // Preload
  const url = getUrlDefault(icon);
  fetch(url, {cache: 'force-cache'}).catch(() => {});

  return (props) => React.createElement(Iconista, {...icon, ...props} as any);
};
