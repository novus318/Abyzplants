import React from 'react';
import { Helmet } from 'react-helmet';
interface LayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  keywords: string;
  author: string;
  canonicalUrl: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  description,
  keywords,
  author,
  canonicalUrl,
}) => {
  const escapedCanonicalUrl = canonicalUrl.replace(/["]/g, '\\"');

  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={author} />
        <script type="application/ld+json">
          {`{
            "@context": "http://schema.org",
            "@type": "WebPage",
            "url": "${escapedCanonicalUrl}"
          }`}
        </script>
        <link rel="canonical" href={canonicalUrl} />
        <title>{title}</title>
      </Helmet>
      {children}
    </div>
  );
};

Layout.defaultProps = {
  title: 'Abyzplants',
  description:
    'We deliver cutting-edge IT solutions tailored to your business needs in UAE, Our team of experts is committed to providing top-notch services that drive results',
  keywords:
    'WinnDeal,windeal,winndeal,it consulting,IT consulting,javacsript,IT solution,IT company,UAE,uae,Dubai,dubai,IT support companies,IT services near me,IT services company,IT firm,IT solutions company,IT company website,it solutions,muhammed nizamudheen m,nizamudheen,Muhammed Nizamudheen M,Nizamudheen,Winndeal UAE,Laptop & desktop suppliers in Dubai,Computer accessories suppliers in UAE,computer hardware suppliers in dubai,managed IT solutions,best it consulting firms,Dubai based IT service providers,IT AMC Service provider,IT remote assistants',
  author: 'Muhammed Nizamudheen M',
  canonicalUrl: 'https://abyzplants.com/',
};

export default Layout;
