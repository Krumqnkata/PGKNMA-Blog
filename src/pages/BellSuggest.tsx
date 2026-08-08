import BellSongForm from "@/components/BellSongForm";
import { SongVoting } from "@/components/SongVoting";
import { InteriorPage } from "@/components/InteriorPage";
const BellSuggest = () => {
  return (
    <InteriorPage>
        <BellSongForm />
        <SongVoting />
    </InteriorPage>
    
  );
};

export default BellSuggest;
