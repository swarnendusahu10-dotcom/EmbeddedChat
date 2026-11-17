import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@embeddedchat/ui-elements';
import PlainSpan from './PlainSpan';
import StrikeSpan from './StrikeSpan';
import ItalicSpan from './ItalicSpan';
import BoldSpan from './BoldSpan';

const getBaseURI = () => {
  if (typeof document === 'undefined') {
    return '';
  }

  if (document.baseURI) {
    return document.baseURI;
  }

  // Should be exactly one tag:
  //   https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base
  const base = document.getElementsByTagName('base');

  // Return location from BASE tag.
  if (base.length > 0) {
    return base[0].href;
  }

  // Else use implementation of documentURI:
  //   http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-baseURI
  return document.URL || '';
};

const isExternal = (href) => {
  if (typeof href !== 'string' || !href.trim()) {
    return false;
  }
  const baseURI = getBaseURI();
  if (!baseURI) {
    return true;
  }
  return href.indexOf(baseURI) !== 0;
};

const sanitizeHref = (href) => {
  if (typeof href !== 'string') {
    return '';
  }
  const trimmed = href.trim();
  if (/^(?:javascript|vbscript|data):/i.test(trimmed)) {
    return '';
  }
  return trimmed;
};

const LinkSpan = ({ href, label }) => {
  const { theme, mode } = useTheme();

  const contents = React.useMemo(() => {
    const labelArray = Array.isArray(label) ? label : [label];

    const labelElements = labelArray.map((content, index) => {
      switch (content?.type) {
        case 'PLAIN_TEXT':
          return <PlainSpan key={index} contents={content.value} />;

        case 'STRIKE':
          return <StrikeSpan key={index} contents={content.value} />;

        case 'ITALIC':
          return <ItalicSpan key={index} contents={content.value} />;

        case 'BOLD':
          return <BoldSpan key={index} contents={content.value} />;

        default:
          return null;
      }
    });

    return labelElements;
  }, [label]);

  const safeHref = sanitizeHref(href);

  if (!safeHref) {
    return <span>{contents}</span>;
  }

  const external = isExternal(safeHref);

  return (
    <a
      href={safeHref}
      title={safeHref}
      style={{
        color:
          mode === 'light' ? theme.colors.info : theme.colors.warningForeground,
      }}
      {...(external ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
    >
      {contents}
    </a>
  );
};

export default LinkSpan;

LinkSpan.propTypes = {
  href: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string,
  ]),
};
