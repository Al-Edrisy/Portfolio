declare module 'next/image' {
    import { ImageProps } from 'next/dist/shared/lib/get-img-props'
    export * from 'next/dist/shared/lib/get-img-props'
    const Image: (props: ImageProps) => JSX.Element
    export default Image
}
