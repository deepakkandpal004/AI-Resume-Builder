import ImageKit from '@imagekit/nodejs';

// Lazy getter for same reason as ai.js
const getImageKit = () =>
  new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/deepakkandpal',
  });

export default getImageKit;
