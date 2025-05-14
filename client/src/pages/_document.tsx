import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google Tag Manager */}
        <script>
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-T624SSXF');`}
        </script>
        {/* End Google Tag Manager */}
      </Head>
      <title>Abyzpalnts</title>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/title.webp"
        />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content="Abyz Plants, the definitive online destination for exceptional indoor and outdoor plants, and a delightful selection of home accessories. Whether it's for offices, malls, hotels, or any setting, count on us for the freshest, healthiest plants. Explore our 'Gift a Plant' option and revel in our swift and reliable delivery service."/>
        <meta name="keywords" content="Abyzplants,Abyzplants UAE,abyzplants uae,Abyzplants dubai,abyzplants dubai,abyzplants,Buy indoor plants online,Buy outdoor plants online,where to buy indoor plants,where to buy outdoor plants,buy indoor plants in Dubai,buy indoor plants in Abu Dhabi,plant stores near me, what are the best indoor plants to buy,indoor plants for my home, flowering indoor plants for home,flowering indoor plants for my office,where can I buy indoor plants for my home,nearest online plant store in Dubai,indoor plant stores near me,online indoor plants,which are the best indoor plants to buy in winter,which are the best indoor plants to buy in summer,outdoor plants in Dubai,where to buy outdoor plants in Dubai,where to buy outdoor plants online,buy outdoor plants online,buy seeds online,buy soil & fertilizers online,buy indoor fertilizers online,buy potting soil online,buy soil for my home,buy plant insecticides,buy plant pesticides,where to buy plant food,where to buy indoor plant pots,where to buy plant pots, where to buy airplants,where to buy large indoor plants, how to water my plants,where to by plant care accessories,indoor plants online,outdoor plants online,flowering plants online,plants gifts online,plant pots online,buy plant pots in Dubai,buy tall indoor plants online,buy tall tree online,buy fertilizers online"/>

        <meta property="og:title" content="Abyzpalnts"/>
    <meta property="og:description" content="Abyz Plants, the definitive online destination for exceptional indoor and outdoor plants, and a delightful selection of home accessories. Whether it's for offices, malls, hotels, or any setting, count on us for the freshest, healthiest plants. Explore our 'Gift a Plant' option and revel in our swift and reliable delivery service."/>
    <meta property="og:url" content="https://abyzplants.com/"/>
    <meta property="og:image" content="https://abyzplants.com/title.webp"/>
    <meta property="og:type" content="website"/>

    <meta name="twitter:title" content="Abyzpalnts"/>
    <meta name="twitter:description" content="Abyz Plants, the definitive online destination for exceptional indoor and outdoor plants, and a delightful selection of home accessories. Whether it's for offices, malls, hotels, or any setting, count on us for the freshest, healthiest plants. Explore our 'Gift a Plant' option and revel in our swift and reliable delivery service."/>
    <meta name="twitter:image" content="https://abyzplants.com/title.webp"/>
    <meta name="twitter:url" content="https://abyzplants.com/"/>
      <body>
      {/* Google Tag Manager (noscript) */}
      <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T624SSXF"
      height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe></noscript>
      {/* End Google Tag Manager (noscript) */}
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-EEHLS0P5RF" />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', 'G-EEHLS0P5RF');
        `}
      </Script>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
