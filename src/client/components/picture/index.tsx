import * as React from 'react'

interface PictureProps extends React.ImgHTMLAttributes<any> {}

function Picture(props: PictureProps) {
  if (!props.src) return null
  if (/\.svg$/.test(props.src)) {
    return (
      <img { ...props } />
    )
  }
  return (
    <picture>
      <source srcSet={ `${ props.src }.webp` } type="image/webp" />
      <img { ...props } />
    </picture>
  )
}

export default Picture
