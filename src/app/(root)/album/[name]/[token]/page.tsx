import type { Metadata } from "next";

import { DetailsHeader } from "@/components/details-header";
import { SliderList } from "@/components/slider";
import { SongList } from "@/components/song-list";
import {
  getAlbumDetails,
  getAlbumFromSameYear,
  getAlbumRecommendations,
  getTrending,
} from "@/lib/jiosaavn-api";

type AlbumDetailsPageProps = {
  params: { name: string; token: string };
};

export async function generateMetadata({
  params,
}: AlbumDetailsPageProps): Promise<Metadata> {
  const { name, token } = params;

  const album = await getAlbumDetails(token);

  return {
    title: album.name,
    description: album.subtitle,
    openGraph: {
      title: album.name,
      description: album.subtitle,
      url: `/album/${name}/${token}`,
      images: {
        url: `/api/og?title=${album.name}&description=${album.subtitle}&image=${album.image[2].link}&square=true`,
        alt: album.name,
      },
    },
  };
}

async function fetcher(token: string) {
  const album = await getAlbumDetails(token);

  const [recommendations, trending, sameYear] = await Promise.all([
    getAlbumRecommendations(album.id),
    getTrending("album"),
    getAlbumFromSameYear(album.year),
  ]);

  return {
    album,
    recommendations,
    trending,
    sameYear,
  };
}

export default async function AlbumDetailsPage(props: AlbumDetailsPageProps) {
  const { album, recommendations, trending, sameYear } = await fetcher(
    props.params.token
  );

  return (
    <div className="space-y-4">
      <DetailsHeader item={album} />

      <SongList items={album.songs} showAlbum={false} />

      {recommendations.length > 0 && (
        <SliderList
          title={album.modules.recommend.title}
          items={recommendations}
        />
      )}

      <SliderList
        title={album.modules.currently_trending.title}
        items={trending}
      />

      <SliderList
        title={album.modules.top_albums_from_same_year.title}
        items={sameYear}
      />

      <SliderList
        title={album.modules.artists.title}
        items={album.artist_map.artists}
      />
    </div>
  );
}
