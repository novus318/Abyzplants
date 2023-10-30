import { Html, Head, Main, NextScript } from 'next/document'
export default function Document() {
  return (
    <Html lang="en">
      <Head/>
      <title>Abyzpalnts</title>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/title.webp"
        />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content="Abyz Plants, the definitive online destination for exceptional indoor and outdoor plants, and a delightful selection of home accessories. Whether it's for offices, malls, hotels, or any setting, count on us for the freshest, healthiest plants. Explore our 'Gift a Plant' option and revel in our swift and reliable delivery service."></meta>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
