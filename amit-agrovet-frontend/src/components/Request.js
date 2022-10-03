import { server } from "../constants/URLConstants";

export const partyUrl = server+"/party"
export const orderUrl = server+"/order"
export const header = {
    headers: {
        "Content-Type" : "application/json"
    }
}

