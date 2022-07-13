import React, { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import {
  Flex,
  Box,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  Text,
  Heading,
  Button,
  useDisclosure,
  Spinner,
  Center,
  HStack,
  IconButton
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import Card from './Card'
import NewAlbum from './NewAlbum'
import { GET_ALL_ALBUMS } from './queries'

// Graphql queries
interface Albums {
  AlbumName: string
  Artist: string
  NumSongs: string
  RecordLabel: string
  ReleaseYear: string
  Sales: string
}
interface PaginatedAlbumsData {
  allAlbums: {
    albums: Albums[]
    nextToken: string
  }
}

interface PaginatedAlbumsDataVars {
  limit: number
  nextToken?: string
}

const TableContent = () => {
  const [page, setPage] = useState<number>(0)
  const [tokens, setToken] = useState<string[]>([''])
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { loading, data } = useQuery<PaginatedAlbumsData, PaginatedAlbumsDataVars>(GET_ALL_ALBUMS, {
    variables: {
      limit: 5,
      nextToken: tokens[page] || undefined
    }
  })

  useEffect(() => {
    setToken((prev) => {
      if (data?.allAlbums.nextToken !== undefined) {
        const prevTokens = [...prev]
        prevTokens[page + 1] = data?.allAlbums.nextToken
        return prevTokens
      }
      return prev
    })
  }, [data, page])
  console.log('Data')
  console.log(data)

  return (
    <Flex direction="column">
      {loading ? (
        <Center>
          <Spinner size="xl" />
        </Center>
      ) : (
        <>
          <Card my="22px" overflowX={{ sm: 'scroll', xl: 'hidden' }} pb="0px" bgColor="white">
            <Flex justifyContent="space-between" mb="10">
              <Heading as="h4" size="lg" ml="5">
                Albums
              </Heading>
              <Button onClick={onOpen}>New Album</Button>
            </Flex>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Artist</Th>
                  <Th>Album Name</Th>
                  <Th>Num. Songs</Th>
                  <Th>Record Label</Th>
                  <Th>Release Year</Th>
                  <Th>Sales</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data &&
                  data?.allAlbums.albums.map((album) => (
                    <Tr key={album.AlbumName}>
                      <Td>{album.Artist}</Td>
                      <Td>{album.AlbumName}</Td>
                      <Td>{album.NumSongs}</Td>
                      <Td>{album.RecordLabel}</Td>
                      <Td>{album.ReleaseYear}</Td>
                      <Td>{album.Sales}</Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
            <HStack justify="center" my={3}>
              <IconButton
                aria-label="left"
                variant="unstyled"
                icon={<ChevronLeftIcon boxSize={8} color="gray.600" />}
                onClick={() => setPage((prevPage) => prevPage - 1)}
                disabled={page === 0}
              />
              <IconButton
                aria-label="right"
                variant="unstyled"
                icon={
                  <ChevronRightIcon
                    boxSize={8}
                    _hover={{
                      color: 'gray.600'
                    }}
                  />
                }
                onClick={() => setPage((prevPage) => prevPage + 1)}
                disabled={tokens[page + 1] === null}
              />
            </HStack>
          </Card>

          <NewAlbum isOpen={isOpen} onClose={onClose} />
        </>
      )}
    </Flex>
  )
}

export default TableContent
