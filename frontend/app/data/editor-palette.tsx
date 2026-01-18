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
  QrCodeIcon,
  FormIcon,
  TrendingUpIcon,
  WhatsAppIcon
} from "~/components/shared/icons";

export type PaletteItem = { type: BioBlock["type"] | string; label: string; icon: React.ReactNode; category: string; isPro?: boolean };

export const getPalette = (t: (key: string) => string): PaletteItem[] => [
  {
    type: "heading",
    label: t("dashboard.editor.palette.heading"),
    category: "Content",
    icon: <HeadingIcon width="24" height="24" />
  },
  {
    type: "qrcode",
    label: t("dashboard.editor.palette.qrcode"),
    category: "Content",
    icon: <QrCodeIcon width="24" height="24" />
  },
  {
    type: "text",
    label: t("dashboard.editor.palette.text"),
    category: "Content",
    icon: <TextIcon width="24" height="24" />
  },
  {
    type: "button",
    label: t("dashboard.editor.palette.button"),
    category: "Content",
    icon: <ButtonIcon width="24" height="24" />
  },
  {
    type: "button_grid",
    label: t("dashboard.editor.palette.buttonGrid"),
    category: "Content",
    icon: <ImageIcon width="24" height="24" />
  },
  {
    type: "image",
    label: t("dashboard.editor.palette.image"),
    category: "Content",
    icon: <ImageIcon width="24" height="24" />
  },
  {
    type: "marketing",
    label: t("dashboard.editor.marketing.slotTitle"),
    category: "Marketing",
    icon: <TrendingUpIcon width="24" height="24" />
  },
  {
    type: "socials",
    label: t("dashboard.editor.palette.socials"),
    category: "Social",
    icon: <SocialsIcon width="24" height="24" />
  },
  {
    type: "whatsapp",
    label: t("dashboard.editor.palette.whatsapp"),
    category: "Social",
    icon: <WhatsAppIcon width="24" height="24" />
  },
  {
    type: "video",
    label: t("dashboard.editor.palette.video"),
    category: "Content",
    icon: <VideoIcon width="24" height="24" />
  },
  {
    type: "blog",
    label: t("dashboard.editor.palette.blog"),
    category: "Blog",
    icon: <BlogIcon width="24" height="24" />
  },
  {
    type: "product",
    label: t("dashboard.editor.palette.productList"),
    category: "Shop",
    icon: <ProductIcon width="24" height="24" />
  },
  {
    type: "calendar",
    label: t("dashboard.editor.palette.calendar"),
    category: "Content",
    isPro: true,
    icon: <CalendarIcon width="24" height="24" />
  },
  {
    type: "map",
    label: t("dashboard.editor.palette.map"),
    category: "Content",
    icon: <MapIcon width="24" height="24" />
  },
  {
    type: "featured",
    label: t("dashboard.editor.palette.featured"),
    category: "Shop",
    icon: <StarIcon width="24" height="24" />
  },
  {
    type: "affiliate",
    label: t("dashboard.editor.palette.affiliateCode"),
    category: "Shop",
    icon: <CopyIcon width="24" height="24" />
  },
  {
    type: "event",
    label: t("dashboard.editor.palette.event"),
    category: "Content",
    icon: <EventIcon width="24" height="24" />
  },
  {
    type: "tour",
    label: t("dashboard.editor.palette.tourDates"),
    category: "Content",
    isPro: true,
    icon: <TourIcon width="24" height="24" />
  },
  {
    type: "spotify",
    label: t("dashboard.editor.palette.spotify"),
    category: "Music",
    icon: <SpotifyIcon width="24" height="24" />
  },
  {
    type: "instagram",
    label: t("dashboard.editor.palette.instagramFeed"),
    category: "Social",
    icon: <InstagramIcon width="24" height="24" />
  },
  {
    type: "youtube",
    label: t("dashboard.editor.palette.youtubeFeed"),
    category: "Social",
    icon: <YouTubeIcon width="24" height="24" />
  },
  {
    type: "divider",
    label: t("dashboard.editor.palette.divider"),
    category: "Layout",
    icon: <DividerIcon width="24" height="24" />
  },
  {
    type: "form",
    label: t("dashboard.editor.palette.form"),
    category: "Content",
    icon: <FormIcon width="24" height="24" />
  },
  {
    type: "portfolio",
    label: t("dashboard.editor.palette.portfolio"),
    category: "Content",
    icon: <ImageIcon width="24" height="24" />
  },

];
