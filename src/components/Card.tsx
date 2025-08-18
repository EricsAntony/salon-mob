import React, { ComponentProps } from 'react';
import { Card as PaperCard } from 'react-native-paper';

type Props = ComponentProps<typeof PaperCard>;

const Card = React.memo((props: Props) => {
  return <PaperCard {...props} />;
});

export default Card;
