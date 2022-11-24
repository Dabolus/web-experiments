import { fileURLToPath } from 'url';
import { viteStaticCopy } from 'vite-plugin-static-copy';
// TODO: replace this path with @webexp/config/... once Vite
// gets support for transpilation of same-monorepo packages
// See: https://github.com/vitejs/vite/issues/5370
import createConfig from '../../config/vite/vanilla';

export default createConfig({
  htmlData: {
    contacts: [
      {
        id: 'email',
        name: 'Email',
        link: 'mailto:giorgio@garasto.me',
      },
      {
        id: 'contact-form',
        name: 'Contact form',
        link: 'https://gga.dev/hi',
      },
      {
        id: 'telegram',
        name: 'Telegram',
        link: 'https://t.me/Dabolus',
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        link: 'https://www.linkedin.com/in/giorgiogarasto',
      },
      {
        id: 'github',
        name: 'GitHub',
        link: 'https://github.com/Dabolus',
      },
      {
        id: 'google-developers',
        name: 'Google Developers',
        link: 'https://g.dev/gga',
      },
      {
        id: 'twitter',
        name: 'Twitter',
        link: 'https://twitter.com/Dabolus',
      },
      {
        id: 'facebook',
        name: 'Facebook',
        link: 'https://fb.me/giorgio.garasto',
      },
      {
        id: 'polywork',
        name: 'Polywork',
        link: 'https://timeline.giorgio.garasto.me',
      },
    ].map(contact => ({
      ...contact,
      text: contact.link.replace(/^[a-z]+:(?:\/\/)?(?:www\.)?/i, ''),
    })),
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: fileURLToPath(
            await import.meta.resolve!(
              '@dabolus/portfolio-data/assets/images/socials',
            ),
          ),
          dest: 'images',
        },
      ],
    }),
  ],
});
