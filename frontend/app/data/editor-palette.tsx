import type { BioBlock } from "~/contexts/bio.context";
import {
  HeadingIcon,
  TextIcon,
  ButtonIcon,
  ImageIcon,
  SocialsIcon,
  VideoIcon,
  BlogIcon,
  ProductIcon,
  CalendarIcon,
  MapIcon,
  StarIcon,
  CopyIcon,
  EventIcon,
  TourIcon,
  SpotifyIcon,
  InstagramIcon,
  YouTubeIcon,
  DividerIcon,
  QrCodeIcon
} from "~/components/icons";

export const palette: Array<{ type: BioBlock["type"] | string; label: string; icon: React.ReactNode; category: string; isPro?: boolean }> = [
  {
    type: "heading",
    label: "Heading",
    category: "Content",
    icon: <HeadingIcon width="24" height="24" />
  },
  {
    type: "qrcode",
    label: "QR Code",
    category: "Content",
    icon: <QrCodeIcon width="24" height="24" />
  },
  {
    type: "text",
    label: "Text",
    category: "Content",
    icon: <TextIcon width="24" height="24" />
  },
  {
    type: "button",
    label: "Button",
    category: "Content",
    icon: <ButtonIcon width="24" height="24" />
  },
  {
    type: "button_grid",
    label: "Button Grid",
    category: "Content",
    icon: <ImageIcon width="24" height="24" />
  },
  {
    type: "image",
    label: "Image",
    category: "Content",
    icon: <ImageIcon width="24" height="24" />
  },
  {
    type: "socials",
    label: "Socials",
    category: "Social",
    icon: <SocialsIcon width="24" height="24" />
  },
  {
    type: "video",
    label: "Video",
    category: "Content",
    icon: <VideoIcon width="24" height="24" />
  },
  {
    type: "blog",
    label: "Blog",
    category: "Blog",
    icon: <BlogIcon width="24" height="24" />
  },
  {
    type: "product",
    label: "Product List",
    category: "Shop",
    icon: <ProductIcon width="24" height="24" />
  },
  {
    type: "calendar",
    label: "Calendar",
    category: "Content",
    icon: <CalendarIcon width="24" height="24" />
  },
  {
    type: "map",
    label: "Map",
    category: "Content",
    icon: <MapIcon width="24" height="24" />
  },
  {
    type: "featured",
    label: "Featured",
    category: "Shop",
    icon: <StarIcon width="24" height="24" />
  },
  {
    type: "affiliate",
    label: "Affiliate Code",
    category: "Shop",
    icon: <CopyIcon width="24" height="24" />
  },
  {
    type: "event",
    label: "Event",
    category: "Content",
    icon: <EventIcon width="24" height="24" />
  },
  {
    type: "tour",
    label: "Tour Dates",
    category: "Content",
    isPro: true,
    icon: <TourIcon width="24" height="24" />
  },
  {
    type: "spotify",
    label: "Spotify",
    category: "Music",
    icon: <SpotifyIcon width="24" height="24" />
  },
  {
    type: "instagram",
    label: "Instagram Feed",
    category: "Social",
    icon: <InstagramIcon width="24" height="24" />
  },
  {
    type: "youtube",
    label: "YouTube Feed",
    category: "Social",
    icon: <YouTubeIcon width="24" height="24" />
  },
  {
    type: "divider",
    label: "Divider",
    category: "Layout",
    icon: <DividerIcon width="24" height="24" />
  },
];
