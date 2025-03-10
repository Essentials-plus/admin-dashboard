/* eslint-disable jsx-a11y/alt-text */
import Image, { ImageProps } from 'next/image';

const image: ImageProps = {
  // src:"/imgs/build-react-js-next-js-website-with-tailwind-css.jpeg",
  // src:"/imgs/ae2b1ba885e8902ae71a128e29d3ba618ecd44d3.webp",
  // src: '/imgs/test.png',
  src: '/imgs/gig/build-react-js-next-js-website-with-tailwind-css-saymon-ss.png',
  width: 3840,
  height: 2307,
  alt: 'Hi',
};

const thumbnails: (ImageProps & { isNew?: boolean })[] = [
  {
    src: '/imgs/thumnails/goodigoo-thumbnail.png',
    alt: 'Thumbnail',
    width: 3993,
    height: 2995,
    isNew: true,
  },
  {
    src: '/imgs/thumnails/didit-thumbnail.png',
    alt: 'Thumbnail',
    width: 3993,
    height: 2995,
    isNew: true,
  },
  {
    src: '/imgs/thumnails/influix-thumbnail.png',
    alt: 'Thumbnail',
    width: 3993,
    height: 2995,
    isNew: true,
  },
  {
    src: '/imgs/thumnails/ligainsider-thumbnail.png',
    alt: 'Thumbnail',
    width: 3993,
    height: 2995,
    isNew: true,
  },
  {
    src: '/imgs/thumnails/black-water-thumbnail.png',
    alt: 'Thumbnail',
    width: 3993,
    height: 2995,
    isNew: true,
  },
  {
    src: '/imgs/thumnails/soleolico-thumbnail.png',
    alt: 'Thumbnail',
    width: 3993,
    height: 2995,
    isNew: true,
  },
  {
    src: '/imgs/thumnails/earth-core-group-thumbnail.png',
    alt: 'Thumbnail',
    width: 3993,
    height: 2995,
  },
  {
    src: '/imgs/thumnails/elysiland-thumbnail.png',
    alt: 'Thumbnail',
    width: 3993,
    height: 2995,
  },
  {
    src: '/imgs/thumnails/ethlizards-thumbnail.png',
    alt: 'Thumbnail',
    width: 3993,
    height: 2995,
  },
  {
    src: '/imgs/thumnails/gamium-world-thumbnail.png',
    alt: 'Thumbnail',
    width: 3993,
    height: 2995,
  },
  {
    src: '/imgs/thumnails/gazoomia-thumbnail.png',
    alt: 'Thumbnail',
    width: 3993,
    height: 2995,
  },

  {
    src: '/imgs/thumnails/image-editor-thumbnail.png',
    alt: 'Thumbnail',
    width: 3993,
    height: 2995,
  },
  {
    src: '/imgs/thumnails/moda-combi-thumbnail.png',
    alt: 'Thumbnail',
    width: 3993,
    height: 2995,
  },
  {
    src: '/imgs/thumnails/nft-wrapped-thumbnail.png',
    alt: 'Thumbnail',
    width: 3993,
    height: 2995,
  },
  {
    src: '/imgs/thumnails/osoyc-thumbnail.png',
    alt: 'Thumbnail',
    width: 3993,
    height: 2995,
  },
  {
    src: '/imgs/thumnails/screenprints-thumbnail.png',
    alt: 'Thumbnail',
    width: 3993,
    height: 2995,
  },
  {
    src: '/imgs/thumnails/seher-thumbnail.png',
    alt: 'Thumbnail',
    width: 3993,
    height: 2995,
  },

  {
    src: '/imgs/thumnails/trust-endorse-thumbnail.png',
    alt: 'Thumbnail',
    width: 3993,
    height: 2995,
  },
  {
    src: '/imgs/thumnails/vooxy-stake-thumbnail.png',
    alt: 'Thumbnail',
    width: 3993,
    height: 2995,
  },
];

const Test = () => {
  return (
    <div className="space-y-5 p-10">
      {/* <div className="mx-auto grid max-w-[1336px] grid-cols-4 gap-x-6 gap-y-10">
        <div className="relative flex h-[189.59px] overflow-hidden rounded-[8px]">
          <Image {...image} className="w-full" />
        </div>
        {Array(4)
          .fill('')
          .map((_, i) => (
            <div
              className="relative flex h-[189.59px] overflow-hidden rounded-[8px] bg-gray-100"
              key={i}
            ></div>
          ))}
        <div className="relative flex h-[189.59px] overflow-hidden rounded-[8px]">
          <Image {...image} className="w-full" />
        </div>

        {Array(1)
          .fill('')
          .map((_, i) => (
            <div
              className="relative flex h-[189.59px] overflow-hidden rounded-[8px] bg-gray-100"
              key={i}
            ></div>
          ))}
        <div className="relative flex h-[189.59px] overflow-hidden rounded-[8px]">
          <Image {...image} className="w-full" />
        </div>
      </div>

      <div className="!mt-20">
        <div className="relative flex h-[429px] w-[714px] items-center justify-center overflow-hidden border border-[#efeff0] bg-[#ff3d3d]">
          <figure className="flex h-full items-center justify-center">
            <Image
              {...image}
              className="container size-full max-h-full min-h-[140px] min-w-[140px] max-w-full"
            />
          </figure>
        </div>
      </div> */}

      <div className="mx-auto my-12 grid max-w-[1336px] grid-cols-3 gap-8">
        {thumbnails.map(({ isNew, ...thumbnail }) => (
          <div
            className="rounded-2xl border border-[##e4e5e7] p-6"
            key={thumbnail.src as string}
          >
            <Image
              {...thumbnail}
              // src={
              //   isNew
              //     ? `${(thumbnail.src as string).replace(
              //         '/imgs/thumnails/',
              //         '/imgs/thumnails/new/'
              //       )}`
              //     : thumbnail.src
              // }
              src={`${(thumbnail.src as string).replace(
                '/imgs/thumnails/',
                '/imgs/thumnails/new/'
              )}`}
              className="w-full overflow-hidden rounded-[8px]"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Test;
