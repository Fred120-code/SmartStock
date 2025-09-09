import React from 'react'
import Image from 'next/image'
interface ProductImageProps {
    src:  string,
    alt:  string,
    heightClass? : string,
    widhtClass?: string,
}

const ProductImage: React.FC<ProductImageProps> = ({src,alt, heightClass, widhtClass}) => {

  return (
    <div className='avatar'>
        <div className={`mask mask-squircle ${heightClass} ${widhtClass}`}>
            <Image 
                src={src}
                alt={alt}
                quality={100}
                className='object-cover'
                height={500}
                width={500}
            />
        </div>
    </div>
  )
}

export default ProductImage