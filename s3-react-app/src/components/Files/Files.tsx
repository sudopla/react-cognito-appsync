import React, { useState, useEffect } from 'react'
import { Auth } from 'aws-amplify'
import { S3Client } from '@aws-sdk/client-s3'
import {
  Flex,
  Heading,
  Center,
  Spinner,
  Button,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  useDisclosure
} from '@chakra-ui/react'
import Card from './Card'
import NewFile from './NewFile'
import { listFiles } from './s3_functions'
import { FileProperties } from './types'

const FilesContent = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [loading, setLoading] = useState<boolean>(false)
  const [s3Files, setS3Files] = useState<FileProperties[] | undefined>([])

  useEffect(() => {
    if (isOpen === false) {
      // Avoid running query when modal for new file opens
      setLoading(true)
      Auth.currentCredentials()
        .then((credentials) => {
          console.log(credentials)
          // Configure S3 Client with AWS credentials
          const s3Client = new S3Client({
            region: process.env.REACT_APP_AWS_REGION,
            credentials: {
              accessKeyId: credentials.accessKeyId,
              secretAccessKey: credentials.secretAccessKey,
              sessionToken: credentials.sessionToken
            }
          })
          // List S3 files
          console.log('Listing files')
          listFiles(s3Client)
            .then((files) => {
              setS3Files(files)
              setLoading(false)
            })
            .catch((error) => {
              console.log(error)
              setLoading(false)
            })
        })
        .catch((error) => {
          console.log(error)
          setLoading(false)
        })
    }
  }, [isOpen])

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
                Files
              </Heading>
              <Button onClick={onOpen}>Upload File</Button>
            </Flex>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Size (KB)</Th>
                  <Th>Last Modified</Th>
                </Tr>
              </Thead>
              <Tbody>
                {s3Files &&
                  s3Files.map((item) => (
                    <Tr key={item.name}>
                      <Td>{item.name}</Td>
                      <Td>{item.size}</Td>
                      <Td>{item.lastModified}</Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </Card>

          <NewFile isOpen={isOpen} onClose={onClose} />
        </>
      )}
    </Flex>
  )
}

export default FilesContent
