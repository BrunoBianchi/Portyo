import { useTranslation } from "react-i18next";

interface SEOSchemaProps {
  type?: "website" | "product" | "faq" | "organization" | "software";
  title?: string;
  description?: string;
  image?: string;
  price?: number;
  currency?: string;
}

export function SEOSchema({ 
  type = "website",
  title,
  description,
  image = "https://portyo.me/og-image.jpg",
  price,
  currency = "USD"
}: SEOSchemaProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language || "en";
  
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": type === "software" ? "SoftwareApplication" : type.charAt(0).toUpperCase() + type.slice(1),
    "name": title || "Portyo - Link in Bio",
    "description": description || "Convert your followers into customers with one link",
    "url": "https://portyo.me",
    "logo": "https://portyo.me/logo.png",
    "image": image,
    "sameAs": [
      "https://twitter.com/portyo",
      "https://instagram.com/portyo",
      "https://linkedin.com/company/portyo"
    ],
  };

  const softwareSchema = type === "software" ? {
    ...baseSchema,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": price || "0",
      "priceCurrency": currency
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "2500"
    }
  } : baseSchema;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(softwareSchema)
      }}
    />
  );
}

export function FAQSchema() {
  const { t } = useTranslation();
  
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": t("faq.q1.question", "What is Portyo?"),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t("faq.q1.answer", "Portyo is an all-in-one platform that allows creators, entrepreneurs, and professionals to create a powerful link-in-bio page. It includes features like newsletter collection, product sales, booking scheduler, automation workflows, and much more.")
        }
      },
      {
        "@type": "Question",
        "name": t("faq.q2.question", "Is Portyo free to use?"),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t("faq.q2.answer", "Yes! Portyo offers a free plan that includes one bio page, one form, basic analytics, and more. You can upgrade to Standard or Pro plans for additional features like custom domains, automation, and zero transaction fees.")
        }
      },
      {
        "@type": "Question",
        "name": t("faq.q3.question", "Can I sell products on Portyo?"),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t("faq.q3.answer", "Absolutely! Portyo integrates with Stripe to let you sell digital products and services directly from your bio page. You can set up products, collect payments, and manage everything from your dashboard.")
        }
      },
      {
        "@type": "Question",
        "name": t("faq.q4.question", "Do I need coding skills?"),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t("faq.q4.answer", "Not at all! Portyo is designed to be user-friendly with a drag-and-drop editor. You can customize your page, add content, and set up features without any coding knowledge.")
        }
      },
      {
        "@type": "Question",
        "name": t("faq.q5.question", "Can I use my own domain?"),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t("faq.q5.answer", "Yes, Standard and Pro plans allow you to connect your own custom domain (like yourname.com) to your Portyo page. This gives your brand a more professional appearance.")
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqData)
      }}
    />
  );
}

export function ReviewSchema() {
  const reviewData = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "SoftwareApplication",
      "name": "Portyo",
      "applicationCategory": "BusinessApplication"
    },
    "author": {
      "@type": "Person",
      "name": "Sarah Chen"
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "5",
      "bestRating": "5"
    },
    "reviewBody": "Portyo completely transformed how I monetize my content. The automation features alone saved me hours every week!"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(reviewData)
      }}
    />
  );
}
