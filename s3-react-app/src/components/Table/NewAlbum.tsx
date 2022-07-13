import React, { useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import {
  Stack,
  FormControl,
  HStack,
  FormLabel,
  Input,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton
} from '@chakra-ui/react'
import { GET_ALL_ALBUMS } from './queries'

interface Album {
  AlbumName: string
  Artist: string
  NumSongs: string
  RecordLabel: string
  ReleaseYear: string
  Sales: string
}

const NEW_ALBUM = gql`
  mutation newAlbum($input: AlbumInput!) {
    newAlbum(input: $input) {
      AlbumName
      Artist
    }
  }
`

interface NewAlbumProps {
  isOpen: boolean
  onClose: () => void
}

const NewAlbum = ({ isOpen, onClose }: NewAlbumProps) => {
  const [artist, setArtist] = useState<string>('')
  const [album, setAlbum] = useState<string>('')
  const [numSongs, setNumSongs] = useState<string>('')
  const [label, setLabel] = useState<string>('')
  const [releaseYear, setReleaseYear] = useState<string>('')
  const [sales, setSales] = useState<string>('')

  const [isSaving, setIsSaving] = useState<boolean>(false)

  const [newAlbum] = useMutation<Album, { input: Album }>(NEW_ALBUM, {
    refetchQueries: [{ query: GET_ALL_ALBUMS }]
  })

  const submitHandler = (event: React.FormEvent): void => {
    event.preventDefault()
    setIsSaving(true)
    newAlbum({
      variables: {
        input: {
          AlbumName: album,
          Artist: artist,
          NumSongs: numSongs,
          RecordLabel: label,
          ReleaseYear: releaseYear,
          Sales: sales
        }
      }
    })
      .then((data) => {
        console.log(data)
        setIsSaving(false)
        onClose()
      })
      .catch((e: Error) => {
        console.error(e)
      })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={submitHandler}>
          <ModalHeader>New Album</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={2}>
              <FormControl id="artist">
                <HStack justifyContent="left" spacing={2}>
                  <FormLabel w="100px">Artist</FormLabel>
                  <Input
                    w="xm"
                    type="text"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setArtist(event.target.value)
                    }
                  />
                </HStack>
              </FormControl>
              <FormControl id="albumName">
                <HStack justifyContent="left" spacing={2}>
                  <FormLabel w="100px">Album Name</FormLabel>
                  <Input
                    w="xm"
                    type="text"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setAlbum(event.target.value)
                    }
                  />
                </HStack>
              </FormControl>
              <FormControl id="numSongs">
                <HStack justifyContent="left" spacing={2}>
                  <FormLabel w="100px"># of Songs</FormLabel>
                  <Input
                    w="xm"
                    type="text"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setNumSongs(event.target.value)
                    }
                  />
                </HStack>
              </FormControl>
              <FormControl id="recordLabel">
                <HStack justifyContent="left" spacing={2}>
                  <FormLabel w="100px">Record Label</FormLabel>
                  <Input
                    w="xm"
                    type="text"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setLabel(event.target.value)
                    }
                  />
                </HStack>
              </FormControl>
              <FormControl id="releaseYear">
                <HStack justifyContent="left" spacing={2}>
                  <FormLabel w="100px">Release Year</FormLabel>
                  <Input
                    w="xm"
                    type="text"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setReleaseYear(event.target.value)
                    }
                  />
                </HStack>
              </FormControl>
              <FormControl id="sales">
                <HStack justifyContent="left" spacing={2}>
                  <FormLabel w="100px">Sales</FormLabel>
                  <Input
                    w="xm"
                    type="text"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setSales(event.target.value)
                    }
                  />
                </HStack>
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button type="submit" isLoading={isSaving} colorScheme="blue" mr={3}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default NewAlbum
