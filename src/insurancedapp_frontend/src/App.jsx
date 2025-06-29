import React from "react";
import { Helmet } from "react-helmet";

function App() {
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,user-scalable=no"
        />
        <meta name="theme-color" content="#000000" />
        <meta name="robots" content="noindex" />
        <link rel="shortcut icon" sizes="16x16" href="/favicon.png" />
        <link rel="shortcut icon" sizes="32x32" href="/favicon@2x.png" />
        <title>Framer Login</title>
        <script>
          {`window.onpageshow = function(event) {
              if (event.persisted) {
                window.location.reload();
              }
            }`}
        </script>
        <script>
          {`window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              'gtm.start': new Date().getTime(),
              event: 'gtm.js'
            });`}
        </script>
        <script async src="https://analytics.framer.com/gtm.js?id=GTM-T3KPVJR"></script>
        <script src="https://framer.com/env.js" defer></script>
        <script src="https://framer.com/static/js/main.5719546b.js" defer></script>
      </Helmet>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <div id="root">
        {/* Your actual React UI goes here */}
      </div>
    </>
  );
}

// DNS ON CANISTERS DOSENT WORK !!!

export default App;
