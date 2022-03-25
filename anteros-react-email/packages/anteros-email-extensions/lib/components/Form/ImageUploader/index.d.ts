import { UploaderServer } from '../../../AttributePanel/utils/Uploader';
export interface ImageUploaderProps {
    onChange: (val: string) => void;
    value: string;
    label: string;
    uploadHandler?: UploaderServer;
    onGetImageGallery?: () => Promise<string>;
}
export declare function ImageUploader(props: ImageUploaderProps): JSX.Element;
