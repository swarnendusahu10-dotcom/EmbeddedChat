import React from 'react';
import PropTypes from 'prop-types';
import PlainSpan from './PlainSpan';
import BoldSpan from './BoldSpan';
import StrikeSpan from './StrikeSpan';
import LinkSpan from './LinkSpan';
import CodeElement from './CodeElement';
import Emoji from './Emoji';
import UserMention from '../mentions/UserMention';
import ChannelMention from '../mentions/ChannelMention';
import ColorElement from './ColorElement';
import TimestampElement from './TimestampElement';

const ItalicSpan = ({ contents }) => {
  const items = Array.isArray(contents) ? contents : [contents].filter(Boolean);

  return (
    <em>
      {items.map((content, index) => {
        switch (content?.type) {
          case 'PLAIN_TEXT':
            return <PlainSpan key={index} contents={content.value} />;

          case 'BOLD':
            return <BoldSpan key={index} contents={content.value} />;

          case 'STRIKE':
            return <StrikeSpan key={index} contents={content.value} />;

          case 'INLINE_CODE':
            return <CodeElement key={index} contents={content.value} />;

          case 'EMOJI':
            return <Emoji key={index} emoji={content} />;

          case 'MENTION_USER':
            return <UserMention key={index} contents={content.value} />;

          case 'MENTION_CHANNEL':
            return (
              <ChannelMention key={index} mention={content.value?.value} />
            );

          case 'COLOR':
            return <ColorElement key={index} {...content.value} />;

          case 'TIMESTAMP':
            return <TimestampElement key={index} contents={content.value} />;

          case 'LINK':
            return (
              <LinkSpan
                key={index}
                href={content.value?.src?.value}
                label={
                  Array.isArray(content.value?.label)
                    ? content.value.label
                    : [content.value?.label]
                }
              />
            );

          default:
            return null;
        }
      })}
    </em>
  );
};

export default ItalicSpan;

ItalicSpan.propTypes = {
  contents: PropTypes.any,
};
