import { gql } from '@apollo/client'

export const GET_ALL_ALBUMS = gql`
  query AlbumList($limit: Int!, $nextToken: String) {
    allAlbums(limit: $limit, nextToken: $nextToken) {
      albums {
        AlbumName
        Artist
        NumSongs
        RecordLabel
        ReleaseYear
        Sales
      }
      nextToken
    }
  }
`
