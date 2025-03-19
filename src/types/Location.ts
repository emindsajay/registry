import { Circle } from "./Circle";
import { Descriptor } from "./Descriptor";

export type Location = {
    id: string;
    descriptor: Descriptor;
    map_url: string;
    gps: string;
    address: string;
    city: {
        name: string;
        code: string;
    };
    district: string;
    state: {
        name: string;
        code: string;
    };
    country: {
        name: string;
        code: string;
    };
    area_code: string;
    circle: Circle;
    polygon: string;
    "3dspace": string;
    rating: string;
};
