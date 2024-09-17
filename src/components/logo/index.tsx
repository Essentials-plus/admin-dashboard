import Image from 'next/image';
import Link from 'next/link';
import { ComponentProps } from 'react';

const Logo = (props: ComponentProps<'div'>) => {
  return (
    <div {...props}>
      <Link href={'/'} className="inline-block">
        <Image src={'/imgs/logo.png'} alt="LOGO" width={960} height={230} />
      </Link>
    </div>
  );
};

export default Logo;
