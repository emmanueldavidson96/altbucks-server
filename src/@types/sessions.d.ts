// types/express.d.ts or @types/express.d.ts

import "express";

declare module "express" {
    export interface Request {
        userId?: string; // Add the custom property
    }
}
