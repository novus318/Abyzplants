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
    'Abyz Plants, the definitive online destination for exceptional indoor and outdoor plants in the UAE, with quick delivery options. Our online plant store guarantees the quality of every plant, making it effortless to purchase for your home, office. With the widest variety of options available,and a delightful selection of home accessories. Whether it is for offices, malls, hotels, or any setting, count on us for the freshest, healthiest plants. Explore our (Gift a Plant) option and revel in our swift and reliable delivery service.',
  keywords:
    'Abyzplants,Abyzplants UAE,abyzplants uae,Abyzplants dubai,abyzplants dubai,abyzplants,Buy indoor plants online,Buy outdoor plants online,where to buy indoor plants,where to buy outdoor plants,buy indoor plants in Dubai,buy indoor plants in Abu Dhabi,plant stores near me, what are the best indoor plants to buy,indoor plants for my home, flowering indoor plants for home,flowering indoor plants for my office,where can I buy indoor plants for my home,nearest online plant store in Dubai,indoor plant stores near me,online indoor plants,which are the best indoor plants to buy in winter,which are the best indoor plants to buy in summer,outdoor plants in Dubai,where to buy outdoor plants in Dubai,where to buy outdoor plants online,buy outdoor plants online,buy seeds online,buy soil & fertilizers online,buy indoor fertilizers online,buy potting soil online,buy soil for my home,buy plant insecticides,buy plant pesticides,where to buy plant food,where to buy indoor plant pots,where to buy plant pots, where to buy airplants,where to buy large indoor plants, how to water my plants,where to by plant care accessories,indoor plants online,outdoor plants online,flowering plants online,plants gifts online,plant pots online,buy plant pots in Dubai,buy tall indoor plants online,buy tall tree online,buy fertilizers online',
  author: 'Muhammed Nizamudheen M',
  canonicalUrl: 'https://abyzplants.com/',
};

export default Layout;
