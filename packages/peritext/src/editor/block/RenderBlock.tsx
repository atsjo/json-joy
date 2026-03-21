import * as React from 'react';
import {LeafBlock} from './LeafBlock';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {Blockquote} from './blocks/Blockquote';
import {Codeblock} from './blocks/Codeblock';
import {TopBlock} from './TopBlock';
import {MidBlock} from './MidBlock';
import type {BlockViewProps} from '../../web/react/BlockView';

export interface RenderBlockProps extends BlockViewProps {
  children: React.ReactNode;
}

export const RenderBlock: React.FC<RenderBlockProps> = (props) => {
  const {block, children} = props;

  let element: React.ReactNode = children;

  const tag = block.tag();

  switch (tag) {
    case '':
      break;
    case SliceTypeCon.p:
      element = <p>{element}</p>;
      break;
    case SliceTypeCon.codeblock:
      element = <Codeblock {...props} />;
      break;
    case SliceTypeCon.blockquote:
      element = <Blockquote {...props} />;
      break;
    case SliceTypeCon.h1:
      element = <h1>{element}</h1>;
      break;
    case SliceTypeCon.h2:
      element = <h2>{element}</h2>;
      break;
    case SliceTypeCon.h3:
      element = <h3>{element}</h3>;
      break;
    case SliceTypeCon.h4:
      element = <h4>{element}</h4>;
      break;
    case SliceTypeCon.h5:
      element = <h5>{element}</h5>;
      break;
    case SliceTypeCon.h6:
      element = <h6>{element}</h6>;
      break;
    case SliceTypeCon.title:
      element = <h1>{element}</h1>;
      break;
    case SliceTypeCon.subtitle:
      element = <h2>{element}</h2>;
      break;
  }

  if (block.isLeaf()) {
    element = <LeafBlock {...props}>{element}</LeafBlock>;
  }

  if (block.isTop()) {
    element = <TopBlock {...props}>{element}</TopBlock>;
  } else {
    element = <MidBlock {...props}>{element}</MidBlock>;
  }

  return element;
};
