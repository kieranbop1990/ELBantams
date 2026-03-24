import { ReactNode } from 'react';
import {
  IconStar, IconUsers, IconTarget, IconHeart, IconTrophy, IconShield,
  IconMapPin, IconCar, IconShirt, IconToolsKitchen2, IconLeaf,
  IconDog, IconUserPlus, IconUserCircle, IconBallFootball, IconCamera,
  IconAward, IconHeartHandshake, IconMail, IconInfoCircle, IconHelp,
} from '@tabler/icons-react';

const SIZE = 18;

/** Map FontAwesome class names (fa-xxx) to Tabler icons. */
const ICON_MAP: Record<string, ReactNode> = {
  'fa-star':           <IconStar size={SIZE} />,
  'fa-users':          <IconUsers size={SIZE} />,
  'fa-bullseye':       <IconTarget size={SIZE} />,
  'fa-heart':          <IconHeart size={SIZE} />,
  'fa-trophy':         <IconTrophy size={SIZE} />,
  'fa-shield-alt':     <IconShield size={SIZE} />,
  'fa-map-marker-alt': <IconMapPin size={SIZE} />,
  'fa-car':            <IconCar size={SIZE} />,
  'fa-shirt':          <IconShirt size={SIZE} />,
  'fa-utensils':       <IconToolsKitchen2 size={SIZE} />,
  'fa-leaf':           <IconLeaf size={SIZE} />,
  'fa-paw':            <IconDog size={SIZE} />,
  'fa-user-plus':      <IconUserPlus size={SIZE} />,
  'fa-child':          <IconUserCircle size={SIZE} />,
  'fa-venus':          <IconUserCircle size={SIZE} />,
  'fa-female':         <IconUserCircle size={SIZE} />,
  'fa-futbol':         <IconBallFootball size={SIZE} />,
  'fa-camera':         <IconCamera size={SIZE} />,
  'fa-award':          <IconAward size={SIZE} />,
  'fa-handshake':      <IconHeartHandshake size={SIZE} />,
  'fa-envelope':       <IconMail size={SIZE} />,
  'fa-info-circle':    <IconInfoCircle size={SIZE} />,
};

export function tablerIcon(faClass: string): ReactNode {
  return ICON_MAP[faClass] ?? <IconHelp size={SIZE} />;
}
