import Document, {
  DocumentContext,
  Html,
  Head,
  Main,
  NextScript,
} from "next/document";
import { ServerStyleSheet } from "styled-components";

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html>
        <Head>
          <style
            dangerouslySetInnerHTML={{
              __html: `
      /* Global Styles & Colors */
      :root {
        --green: #6aaa64;
        --darkendGreen: #538d4e;
        --yellow: #c9b458;
        --darkendYellow: #b59f3b;
        --lightGray: #d8d8d8;
        --gray: #86888a;
        --darkGray: #939598;
        --white: #fff;
        --black: #212121;
        /* Colorblind colors */
        --orange: #f5793a;
        --blue: #85c0f9;
        font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
        font-size: 16px;
        --header-height: 50px;
        --keyboard-height: 200px;
        --game-max-width: 500px;
      }
      /* Light theme colors */
      :root {
        --color-tone-1: #1a1a1b;
        --color-tone-2: #787c7e;
        --color-tone-3: #878a8c;
        --color-tone-4: #d3d6da;
        --color-tone-5: #edeff1;
        --color-tone-6: #f6f7f8;
        --color-tone-7: #ffffff;
        --opacity-50: rgba(255, 255, 255, 0.5);
      }
      /* Dark Theme Colors */
      .nightmode {
        --color-tone-1: #d7dadc;
        --color-tone-2: #818384;
        --color-tone-3: #565758;
        --color-tone-4: #3a3a3c;
        --color-tone-5: #272729;
        --color-tone-6: #1a1a1b;
        --color-tone-7: #121213;
        --opacity-50: rgba(0, 0, 0, 0.5);
      }
      /* Constant colors and colors derived from theme */
      :root,
      .nightmode {
        --color-background: var(--color-tone-7);
      }
      :root {
        --color-present: var(--yellow);
        --color-correct: var(--green);
        --color-absent: var(--color-tone-2);
        --tile-text-color: var(--color-tone-7);
        --key-text-color: var(--color-tone-1);
        --key-evaluated-text-color: var(--color-tone-7);
        --key-bg: var(--color-tone-4);
        --key-bg-present: var(--color-present);
        --key-bg-correct: var(--color-correct);
        --key-bg-absent: var(--color-absent);
        --modal-content-bg: var(--color-tone-7);
      }
      .nightmode {
        --color-present: var(--darkendYellow);
        --color-correct: var(--darkendGreen);
        --color-absent: var(--color-tone-4);
        --tile-text-color: var(--color-tone-1);
        --key-text-color: var(--color-tone-1);
        --key-evaluated-text-color: var(--color-tone-1);
        --key-bg: var(--color-tone-2);
        --key-bg-present: var(--color-present);
        --key-bg-correct: var(--color-correct);
        --key-bg-absent: var(--color-absent);
        --modal-content-bg: var(--color-tone-7);
      }
      .colorblind {
        --color-correct: var(--orange);
        --color-present: var(--blue);
        --tile-text-color: var(--white);
        --key-bg-present: var(--color-present);
        --key-bg-correct: var(--color-correct);
        --key-bg-absent: var(--color-absent);
      }
      html, div[data-reactroot] {
        height: 100%;
      }
      body {
        height: 100%;
        background-color: var(--color-background);
        margin: 0;
        padding: 0;
        /* Prevent scrollbar appearing on page transition */
        overflow-y: hidden;
      }
    `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
