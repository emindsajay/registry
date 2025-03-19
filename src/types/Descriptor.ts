import { Image } from "./Image";
import { Media } from "./Media";

export type Descriptor = {
    name: string;
    code: string;
    short_desc: string;
    long_desc: string;
    additional_desc: {
        url: string;
        content_type: string;
    };
    media: Media[];
    images: Image[];
};
