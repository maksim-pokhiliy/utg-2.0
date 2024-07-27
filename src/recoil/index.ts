import { RecoilRoot } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export { RecoilRoot, persistAtom };
