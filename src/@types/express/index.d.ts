
import { HydratedDocument } from "mongoose"
import { IUser } from "../../auth/auth.interface"

declare global{
    namespace Express {
        interface Request {
            user: HydratedDocument<IUser>
        }
    }
}