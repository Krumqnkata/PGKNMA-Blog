import BellSongForm from "@/components/BellSongForm";
import { SongVoting } from "@/components/SongVoting";
const BellSuggest = () => {
  return (
    <div className="w-full">
      <main>
        <BellSongForm />
        <div>
          <SongVoting />
        </div>
      </main>
    </div>
    
  );
};

export default BellSuggest;
