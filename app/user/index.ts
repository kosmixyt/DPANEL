import * as express from 'express';
export const UserRouter = express.Router();


UserRouter.get("/", UserRouterGet);


export function UserRouterGet(req: express.Request, res: express.Response) {
    console.log(req.params)
    res.send("Hello World");
}